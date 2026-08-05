package com.bidzo.repository;

import com.bidzo.entity.VendorProfile;
import com.bidzo.entity.VendorWallet;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorWalletRepository extends JpaRepository<VendorWallet, Long> {

    Optional<VendorWallet> findById(Long id);
    List<VendorWallet> findAllByVendor(VendorProfile vendor);
    Page<VendorWallet> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}