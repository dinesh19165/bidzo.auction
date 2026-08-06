package com.bidzo.repository;

import com.bidzo.entity.CustomerWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletRepository extends JpaRepository<CustomerWallet, Long> {
}
