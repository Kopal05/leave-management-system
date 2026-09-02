package com.lms.controller;

import com.lms.entity.RegistrationRequest;
import com.lms.service.RegistrationRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/registration-requests")
@RequiredArgsConstructor
public class AdminRegistrationController {

    private final RegistrationRequestService registrationRequestService;

    @GetMapping("/pending")
    public ResponseEntity<List<RegistrationRequest>> getPendingRequests() {

        return ResponseEntity.ok(
                registrationRequestService.getPendingRequests()
        );
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveRequest(
            @PathVariable Long id) {

        registrationRequestService.approveRequest(id);

        return ResponseEntity.ok(
                "Registration request approved successfully"
        );
    }

    @PutMapping("/{id}/decline")
    public ResponseEntity<String> declineRequest(
            @PathVariable Long id) {

        registrationRequestService.rejectRequest(id);

        return ResponseEntity.ok(
                "Registration request declined successfully"
        );
    }
}