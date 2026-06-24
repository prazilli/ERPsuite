package com.amdox.erp.modules.tenants;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    public List<TenantDto> getAllTenants() {
        return tenantService.getAllTenants();
    }

    @GetMapping("/{id}")
    public TenantDto getTenantById(@PathVariable UUID id) {
        return tenantService.getTenantById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TenantDto createTenant(@RequestBody TenantDto request) {
        return tenantService.createTenant(request);
    }
}
