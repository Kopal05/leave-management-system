package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Shape returned by GET /dashboard.
 * For USER role: upcomingLeaves = own leaves, other admin-only fields are null.
 * For ADMIN role: all fields populated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private List<LeaveResponse> upcomingLeaves;
    private List<CalendarEntry> teamCalendar;
    private List<UserResponse> allEmployees;       // admin only
    private List<OverlapWarning> overlapWarnings;   // admin only
}
