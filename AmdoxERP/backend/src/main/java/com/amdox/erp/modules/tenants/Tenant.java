package com.amdox.erp.modules.tenants;

import com.amdox.erp.core.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tenants")
@Getter
@Setter
public class Tenant extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String domain;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE')")
    private TenantStatus status = TenantStatus.ACTIVE;

    public enum TenantStatus {
        ACTIVE, SUSPENDED, INACTIVE
    }
}
