package com.bidzo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vendor_banks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorBank {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendor;

    private String bankName;
    private String accountNumber;
    private String ifsc;
    private String branch;
}
