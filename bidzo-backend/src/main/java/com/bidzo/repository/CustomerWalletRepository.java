package com.bidzo.repository;

import com.bidzo.entity.CustomerProfile;
import com.bidzo.entity.CustomerWallet;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerWalletRepository extends JpaRepository<CustomerWallet, Long> {

    Optional<CustomerWallet> findById(Long id);
    List<CustomerWallet> findAllByCustomer(CustomerProfile customer);
    Page<CustomerWallet> findAllByCustomer(CustomerProfile customer, Pageable pageable);
    long countByCustomer(CustomerProfile customer);
}