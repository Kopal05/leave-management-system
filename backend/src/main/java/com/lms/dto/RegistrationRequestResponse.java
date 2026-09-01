package com.lms.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegistrationRequestResponse {

    private Long id;
    private String name;
    private String email;
    private LocalDateTime requestedAt;
}