package com.lms.service;

import com.lms.dto.*;
import com.lms.entity.Leave;
import com.lms.entity.LeaveStatus;
import com.lms.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final LeaveRepository leaveRepository;
    private final LeaveService leaveService;
    private final UserService userService;

    public DashboardResponse getUserDashboard(Long userId) {
        List<LeaveResponse> myUpcoming = leaveService.getMyLeaves(userId).stream()
                .filter(l -> "PLANNED".equals(l.getStatus()) && !l.getStartDate().isBefore(LocalDate.now()))
                .toList();

        return DashboardResponse.builder()
                .upcomingLeaves(myUpcoming)
                .teamCalendar(leaveService.getCalendarEntries(userId, false))
                .allEmployees(null)
                .overlapWarnings(null)
                .build();
    }

    public DashboardResponse getAdminDashboard() {
        List<LeaveResponse> upcoming = leaveService.getAllLeaves().stream()
                .filter(l -> !l.getStartDate().isBefore(LocalDate.now()))
                .toList();

        return DashboardResponse.builder()
                .upcomingLeaves(upcoming)
                .teamCalendar(leaveService.getCalendarEntries(null, true))
                .allEmployees(userService.getAllUsers())
                .overlapWarnings(computeOverlapWarnings())
                .build();
    }

    /**
     * Scans all planned leaves and reports every pair of employees whose
     * leave dates overlap - purely informational, for resource planning.
     */
    private List<OverlapWarning> computeOverlapWarnings() {
        List<Leave> planned = leaveRepository.findByStatusOrderByStartDateAsc(LeaveStatus.PLANNED);
        List<OverlapWarning> warnings = new ArrayList<>();

        for (int i = 0; i < planned.size(); i++) {
            for (int j = i + 1; j < planned.size(); j++) {
                Leave a = planned.get(i);
                Leave b = planned.get(j);

                if (a.getUser().getId().equals(b.getUser().getId())) {
                    continue; // same employee, not a cross-team overlap
                }

                LocalDate overlapStart = a.getStartDate().isAfter(b.getStartDate()) ? a.getStartDate() : b.getStartDate();
                LocalDate overlapEnd = a.getEndDate().isBefore(b.getEndDate()) ? a.getEndDate() : b.getEndDate();

                if (!overlapStart.isAfter(overlapEnd)) {
                    warnings.add(OverlapWarning.builder()
                            .employeeOneName(a.getUser().getName())
                            .employeeTwoName(b.getUser().getName())
                            .overlapStart(overlapStart)
                            .overlapEnd(overlapEnd)
                            .build());
                }
            }
        }
        return warnings;
    }
}
