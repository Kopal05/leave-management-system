package com.lms.controller;

import com.lms.dto.ApiResponse;
import com.lms.dto.CalendarEntry;
import com.lms.entity.Role;
import com.lms.security.CustomUserDetails;
import com.lms.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final LeaveService leaveService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CalendarEntry>>> getCalendar(
            @AuthenticationPrincipal CustomUserDetails principal) {

        boolean isAdmin = principal.getUser().getRole() == Role.ADMIN;
        List<CalendarEntry> entries = leaveService.getCalendarEntries(principal.getId(), isAdmin);

        return ResponseEntity.ok(ApiResponse.success(entries));
    }
}