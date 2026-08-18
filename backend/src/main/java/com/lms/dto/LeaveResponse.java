package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveResponse {
    private Long id;
    private String title;
    private String reason;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Created By info
    private Long userId;
    private String userName;

    // true if edit/cancel cutoff has already passed
    private boolean editable;

    // populated only right after "apply" if another employee overlaps
    private String overlapWarning;
}
