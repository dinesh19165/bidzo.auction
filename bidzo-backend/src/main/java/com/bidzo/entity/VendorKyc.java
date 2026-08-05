package com.bidzo.entity;

import com.bidzo.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vendor_kyc", indexes = {@Index(columnList = "vendor_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorKyc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendor;

    private String documentType;
    private String documentNumber;
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    private KycStatus status;

    private String remarks;
}
