package com.bidzo.entity;

import com.bidzo.enums.WalletType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "customer_wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerWallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private CustomerProfile customer;

    @Enumerated(EnumType.STRING)
    private WalletType type;

    private BigDecimal balance = BigDecimal.ZERO;

    @OneToMany(mappedBy = "customerWallet", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<WalletTransaction> transactions = new HashSet<>();

    public void addTransaction(WalletTransaction t) {
        transactions.add(t);
        t.setCustomerWallet(this);
    }
}
