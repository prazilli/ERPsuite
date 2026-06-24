package com.amdox.erp.modules.users;

import java.util.UUID;

public record UserDto(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String status,
    String roleName
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getStatus().name(),
            user.getRole() != null ? user.getRole().getName() : null
        );
    }
}
