package com.amdox.erp.modules.auth;

import com.amdox.erp.modules.users.User;
import com.amdox.erp.modules.users.UserRepository;
import com.amdox.erp.security.JwtService;
import com.amdox.erp.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(AuthRequest request) {
        // Enforce tenant context for login
        TenantContext.setCurrentTenant(request.tenantId());
        
        User user = userRepository.findByTenantIdAndEmail(UUID.fromString(request.tenantId()), request.email())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("User account is not active");
        }

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getExpirationTime()
        );
    }
}
