package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "franchise_revenue", indexes = {
        @Index(name = "idx_franchise_revenue_franchise", columnList = "franchise_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FranchiseRevenue extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "franchise_id", nullable = false)
    private Franchise franchise;

    @Column(name = "period_start")
    private OffsetDateTime periodStart;

    @Column(name = "period_end")
    private OffsetDateTime periodEnd;

    @Column(name = "total_revenue", precision = 19, scale = 4, nullable = false)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "platform_share", precision = 19, scale = 4)
    private BigDecimal platformShare;

    @Column(name = "franchise_share", precision = 19, scale = 4)
    private BigDecimal franchiseShare;
}
