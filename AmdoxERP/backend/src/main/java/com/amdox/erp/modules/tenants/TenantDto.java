package com.amdox.erp.modules.tenants;

import java.util.UUID;

public record TenantDto(
    UUID id,
    String name,
    String domain,
    String status
) {
    public static TenantDto fromEntity(Tenant tenant) {
        return new TenantDto(
            tenant.getId(),
            tenant.getName(),
            tenant.getDomain(),
            tenant.getStatus().name()
        );
    }
}
