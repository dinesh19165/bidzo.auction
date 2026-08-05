package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "audit_log", indexes = {
        @Index(name = "idx_audit_log_entity", columnList = "entity_name,entity_id"),
        @Index(name = "idx_audit_log_user", columnList = "performed_by")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_name", length = 128, nullable = false)
    private String entityName;

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "action", length = 64, nullable = false)
    private String action;

    @Column(name = "performed_by", length = 128)
    private String performedBy;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
}
