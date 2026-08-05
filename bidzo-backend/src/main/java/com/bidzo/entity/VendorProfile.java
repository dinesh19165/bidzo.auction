package com.bidzo.entity;

import com.bidzo.enums.VendorStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vendor_profiles", indexes = {@Index(columnList = "companyName")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private VendorStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "franchise_id")
    private Franchise franchise;
}
