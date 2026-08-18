package com.lms.service;

import com.lms.dto.CalendarEntry;
import com.lms.dto.LeaveRequest;
import com.lms.dto.LeaveResponse;
import com.lms.entity.Leave;
import com.lms.entity.LeaveStatus;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.LeaveRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

    // Configurable via application.properties: leave.edit-cutoff-days
    @Value("${leave.edit-cutoff-days}")
    private int editCutoffDays;

    public LeaveResponse applyLeave(Long userId, LeaveRequest request) {
        User user = findUserOrThrow(userId);
        validateDates(request.getStartDate(), request.getEndDate());

        Leave leave = Leave.builder()
                .user(user)
                .title(request.getTitle())
                .reason(request.getReason())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(LeaveStatus.PLANNED)
                .build();

        Leave saved = leaveRepository.save(leave);

        String overlapWarning = buildOverlapWarning(saved);

        return toResponse(saved, overlapWarning);
    }

    public List<LeaveResponse> getMyLeaves(Long userId) {
        return leaveRepository.findByUserIdOrderByStartDateDesc(userId).stream()
                .map(l -> toResponse(l, null))
                .toList();
    }

    public List<LeaveResponse> getAllLeaves() {
        return leaveRepository.findByStatusOrderByStartDateAsc(LeaveStatus.PLANNED).stream()
                .map(l -> toResponse(l, null))
                .toList();
    }

    public LeaveResponse updateLeave(Long leaveId, Long requesterId, boolean isAdmin, LeaveRequest request) {
        Leave leave = findLeaveOrThrow(leaveId);
        assertOwnerOrAdmin(leave, requesterId, isAdmin);
        assertEditableOrThrow(leave);

        validateDates(request.getStartDate(), request.getEndDate());

        leave.setTitle(request.getTitle());
        leave.setReason(request.getReason());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());

        Leave saved = leaveRepository.save(leave);
        String overlapWarning = buildOverlapWarning(saved);

        return toResponse(saved, overlapWarning);
    }

    public void cancelLeave(Long leaveId, Long requesterId, boolean isAdmin) {
        Leave leave = findLeaveOrThrow(leaveId);
        assertOwnerOrAdmin(leave, requesterId, isAdmin);
        assertEditableOrThrow(leave);

        leave.setStatus(LeaveStatus.CANCELLED);
        leaveRepository.save(leave);
    }

    public List<CalendarEntry> getCalendarEntries(Long userId, boolean isAdmin) {
    List<Leave> leaves = leaveRepository.findByStatusOrderByStartDateAsc(LeaveStatus.PLANNED);

    if (!isAdmin) {
        leaves = leaves.stream()
                .filter(l -> l.getUser().getId().equals(userId))
                .toList();
    }

    return leaves.stream()
            .map(l -> CalendarEntry.builder()
                    .leaveId(l.getId())
                    .employeeName(l.getUser().getName())
                    .title(l.getTitle())
                    .startDate(l.getStartDate())
                    .endDate(l.getEndDate())
                    .build())
            .toList();
}

    /**
     * A leave can be edited/cancelled only while "today" is on or before
     * (startDate - cutoffDays). Example: start date 25 July, cutoff 5 days
     * -> editable through 20 July, blocked from 21 July onward.
     */
    public boolean isEditable(Leave leave) {
        if (leave.getStatus() == LeaveStatus.CANCELLED) {
            return false;
        }
        LocalDate lastEditableDate = leave.getStartDate().minusDays(editCutoffDays);
        return !LocalDate.now().isAfter(lastEditableDate);
    }

    private void assertEditableOrThrow(Leave leave) {
        if (!isEditable(leave)) {
            throw new BadRequestException(
                    "This leave can no longer be edited or cancelled. The cutoff period ("
                            + editCutoffDays + " day(s) before the start date) has passed.");
        }
    }

    private void assertOwnerOrAdmin(Leave leave, Long requesterId, boolean isAdmin) {
        if (isAdmin) {
            return;
        }
        if (!leave.getUser().getId().equals(requesterId)) {
            throw new BadRequestException("You can only modify your own leaves");
        }
    }

    private void validateDates(LocalDate start, LocalDate end) {
        if (start.isBefore(LocalDate.now())) {
            throw new BadRequestException("Start date cannot be in the past");
        }
        if (end.isBefore(start)) {
            throw new BadRequestException("End date must be on or after the start date");
        }
    }

    /**
     * Checks if any other employee already has a planned leave overlapping
     * this one. Does NOT block the leave - only returns a warning message.
     */
    private String buildOverlapWarning(Leave leave) {
        List<Leave> overlaps = leaveRepository.findOverlappingLeavesForOtherUsers(
                leave.getUser().getId(), leave.getStartDate(), leave.getEndDate());

        if (overlaps.isEmpty()) {
            return null;
        }
        return "Another team member is already on leave during this period.";
    }

    private Leave findLeaveOrThrow(Long id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found with id: " + id));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    private LeaveResponse toResponse(Leave leave, String overlapWarning) {
        return LeaveResponse.builder()
                .id(leave.getId())
                .title(leave.getTitle())
                .reason(leave.getReason())
                .startDate(leave.getStartDate())
                .endDate(leave.getEndDate())
                .status(leave.getStatus().name())
                .createdAt(leave.getCreatedAt())
                .updatedAt(leave.getUpdatedAt())
                .userId(leave.getUser().getId())
                .userName(leave.getUser().getName())
                .editable(isEditable(leave))
                .overlapWarning(overlapWarning)
                .build();
    }
}
