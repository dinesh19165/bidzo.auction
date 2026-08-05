package com.bidzo.repository;

import com.bidzo.entity.VendorBank;
import com.bidzo.entity.VendorProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorBankRepository extends JpaRepository<VendorBank, Long> {

    Optional<VendorBank> findById(Long id);
    List<VendorBank> findAllByVendor(VendorProfile vendor);
    Page<VendorBank> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}