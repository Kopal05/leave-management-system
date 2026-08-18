package com.lms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    // Optional on update (leave blank to keep existing password)
    private String password;

    @NotNull(message = "Role is required")
    private String role; // "ADMIN" or "USER"
}
