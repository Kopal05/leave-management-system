package com.lms.controller;

import com.lms.dto.ApiResponse;
import com.lms.dto.LeaveRequest;
import com.lms.dto.LeaveResponse;
import com.lms.entity.Role;
import com.lms.security.CustomUserDetails;
import com.lms.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveResponse>> applyLeave(@AuthenticationPrincipal CustomUserDetails principal,
                                                                   @Valid @RequestBody LeaveRequest request) {
        LeaveResponse response = leaveService.applyLeave(principal.getId(), request);

        String message = response.getOverlapWarning() != null
                ? response.getOverlapWarning()
                : "Leave applied successfully";

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(message, response));
    }

    // All planned leaves across the org (admin-oriented, but any authenticated user can browse)
    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getAllLeaves() {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getAllLeaves()));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeaveResponse>>> getMyLeaves(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success(leaveService.getMyLeaves(principal.getId())));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LeaveResponse>> updateLeave(@AuthenticationPrincipal CustomUserDetails principal,
                                                                    @PathVariable Long id,
                                                                    @Valid @RequestBody LeaveRequest request) {
        boolean isAdmin = principal.getUser().getRole() == Role.ADMIN;
        LeaveResponse response = leaveService.updateLeave(id, principal.getId(), isAdmin, request);
        return ResponseEntity.ok(ApiResponse.success("Leave updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelLeave(@AuthenticationPrincipal CustomUserDetails principal,
                                                           @PathVariable Long id) {
        boolean isAdmin = principal.getUser().getRole() == Role.ADMIN;
        leaveService.cancelLeave(id, principal.getId(), isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Leave cancelled successfully", null));
    }
}
