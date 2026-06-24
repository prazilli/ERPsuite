package com.amdox.erp.modules.tenants;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public List<TenantDto> getAllTenants() {
        return tenantRepository.findAll().stream()
                .map(TenantDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TenantDto getTenantById(UUID id) {
        return tenantRepository.findById(id)
                .map(TenantDto::fromEntity)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
    }

    @Transactional
    public TenantDto createTenant(TenantDto request) {
        if (tenantRepository.findByDomain(request.domain()).isPresent()) {
            throw new RuntimeException("Domain already in use");
        }
        Tenant tenant = new Tenant();
        tenant.setName(request.name());
        tenant.setDomain(request.domain());
        return TenantDto.fromEntity(tenantRepository.save(tenant));
    }
}
