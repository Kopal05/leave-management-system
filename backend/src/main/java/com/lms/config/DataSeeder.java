package com.lms.config;

import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Ensures at least one ADMIN user exists so the app is usable on first run,
 * since user registration is intentionally NOT public.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.default-admin.name}")
    private String defaultAdminName;

    @Value("${app.default-admin.email}")
    private String defaultAdminEmail;

    @Value("${app.default-admin.password}")
    private String defaultAdminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name(defaultAdminName)
                    .email(defaultAdminEmail)
                    .password(passwordEncoder.encode(defaultAdminPassword))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Default admin created -> email: " + defaultAdminEmail
                    + " | password: " + defaultAdminPassword);
        }
    }
}
