package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import com.bidzo.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "withdrawal_requests", indexes = {@Index(columnList = "vendor_id"), @Index(columnList = "request_ref")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WithdrawalRequest extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendor;

    private BigDecimal amount;
    private String requestRef;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private OffsetDateTime requestedAt;
}
