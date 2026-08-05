package com.bidzo.entity;

import com.bidzo.enums.CommonStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "vendor_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendor;

    private String planName;
    private Double amount;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;

    @Enumerated(EnumType.STRING)
    private CommonStatus status;
}
