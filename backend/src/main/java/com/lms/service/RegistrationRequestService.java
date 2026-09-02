package com.lms.service;

import com.lms.dto.RegistrationRequestDto;
import com.lms.dto.RegistrationRequestResponse;
import com.lms.entity.RegistrationRequest;
import com.lms.entity.RegistrationStatus;
import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.RegistrationRequestRepository;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegistrationRequestService {

    private static final String ALLOWED_EMAIL_DOMAIN = "@hcltech.com";

    private final RegistrationRequestRepository registrationRequestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // User submits registration request
    public RegistrationRequest register(RegistrationRequestDto request) {

        validateCompanyEmail(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "A user with this email already exists"
            );
        }

        if (registrationRequestRepository.existsByEmailAndStatus(request.getEmail(),
                RegistrationStatus.PENDING)) {
            throw new BadRequestException(
            "A registration request for this email is already pending"
    );
}

        RegistrationRequest registrationRequest =
                RegistrationRequest.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .password(passwordEncoder.encode(request.getPassword()))
                        .status(RegistrationStatus.PENDING)
                        .build();

        return registrationRequestRepository.save(registrationRequest);
    }

    // Admin sees only pending requests
    public List<RegistrationRequestResponse> getPendingRequests() {

    return registrationRequestRepository
            .findByStatusOrderByRequestedAtDesc(
                    RegistrationStatus.PENDING
            )
            .stream()
            .map(request -> RegistrationRequestResponse.builder()
                    .id(request.getId())
                    .name(request.getName())
                    .email(request.getEmail())
                    .requestedAt(request.getRequestedAt())
                    .build())
            .toList();
}

    // Admin approves request
    public void approveRequest(Long id) {

        RegistrationRequest request =
                findRequestOrThrow(id);

        if (request.getStatus() != RegistrationStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending requests can be approved"
            );
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException(
                    "A user with this email already exists"
            );
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(Role.USER)
                .build();

        userRepository.save(user);

        request.setStatus(RegistrationStatus.APPROVED);
        request.setProcessedAt(LocalDateTime.now());

        registrationRequestRepository.save(request);
    }

    // Admin declines request
    public void rejectRequest(Long id) {

        RegistrationRequest request =
                findRequestOrThrow(id);

        if (request.getStatus() != RegistrationStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending requests can be declined"
            );
        }

        request.setStatus(RegistrationStatus.REJECTED);
        request.setProcessedAt(LocalDateTime.now());

        registrationRequestRepository.save(request);
    }

    private RegistrationRequest findRequestOrThrow(Long id) {

        return registrationRequestRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Registration request not found with id: " + id
                        ));
    }

    private void validateCompanyEmail(String email) {

        if (email == null ||
                !email.trim()
                        .toLowerCase()
                        .endsWith(ALLOWED_EMAIL_DOMAIN)) {

            throw new BadRequestException(
                    "Only emails from "
                            + ALLOWED_EMAIL_DOMAIN
                            + " are allowed"
            );
        }
    }
}