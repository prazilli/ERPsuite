package com.amdox.erp.tenant;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<String> {

    @Override
    public String resolveCurrentTenantIdentifier() {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            return tenantId;
        }
        // Fallback or default tenant for bootstrap/login (e.g., global schema operations)
        return "GLOBAL"; 
    }

    @Override
    public boolean validateExistingCurrentSessions() {
        return true;
    }
}
