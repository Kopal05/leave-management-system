package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * A single row shown on the Team Calendar - just enough info to render it.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEntry {
    private Long leaveId;
    private String employeeName;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;
}
