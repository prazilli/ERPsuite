package com.amdox.erp.modules.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
    @NotBlank(message = "Tenant ID is required") String tenantId,
    @NotBlank(message = "Email is required") @Email String email,
    @NotBlank(message = "Password is required") String password
) {}
