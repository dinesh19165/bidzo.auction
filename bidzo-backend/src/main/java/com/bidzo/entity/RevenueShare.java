package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "revenue_share", indexes = {
        @Index(name = "idx_revenue_share_entity", columnList = "entity_type,entity_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueShare extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", length = 64, nullable = false)
    private String entityType; // e.g., VENDOR, FRANCHISE

    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    @Column(name = "percentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal percentage;

    @Column(name = "description", length = 512)
    private String description;
}
