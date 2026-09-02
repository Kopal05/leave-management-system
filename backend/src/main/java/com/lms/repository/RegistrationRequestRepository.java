package com.lms.repository;

import com.lms.entity.RegistrationRequest;
import com.lms.entity.RegistrationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRequestRepository
        extends JpaRepository<RegistrationRequest, Long> {

    List<RegistrationRequest> findByStatusOrderByRequestedAtDesc(
            RegistrationStatus status
    );

    boolean existsByEmailAndStatus(String email, RegistrationStatus status);
}