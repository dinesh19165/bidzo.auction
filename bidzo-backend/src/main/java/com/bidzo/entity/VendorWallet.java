package com.bidzo.entity;

import com.bidzo.enums.CommonStatus;
import com.bidzo.enums.WalletType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "vendor_wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendor;

    @Enumerated(EnumType.STRING)
    private WalletType type;

    private BigDecimal balance = BigDecimal.ZERO;

    @OneToMany(mappedBy = "vendorWallet", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WalletTransaction> transactions = new HashSet<>();

    public void addTransaction(WalletTransaction t) {
        transactions.add(t);
        t.setVendorWallet(this);
    }
}
