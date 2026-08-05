package com.bidzo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "wallet_transactions", indexes = {@Index(columnList = "transactionRef")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transactionRef;

    private BigDecimal amount;

    private String description;

    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_wallet_id")
    private VendorWallet vendorWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_wallet_id")
    private CustomerWallet customerWallet;
}
