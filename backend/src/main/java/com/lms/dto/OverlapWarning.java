package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OverlapWarning {
    private String employeeOneName;
    private String employeeTwoName;
    private LocalDate overlapStart;
    private LocalDate overlapEnd;
}
