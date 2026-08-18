package com.lms.controller;

import com.lms.dto.ApiResponse;
import com.lms.dto.DashboardResponse;
import com.lms.entity.Role;
import com.lms.security.CustomUserDetails;
import com.lms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(@AuthenticationPrincipal CustomUserDetails principal) {
        DashboardResponse response = principal.getUser().getRole() == Role.ADMIN
                ? dashboardService.getAdminDashboard()
                : dashboardService.getUserDashboard(principal.getId());

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
