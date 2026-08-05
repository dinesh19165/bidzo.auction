package com.bidzo.repository;

import com.bidzo.entity.VendorPayout;
import com.bidzo.entity.VendorProfile;
import com.bidzo.enums.PaymentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorPayoutRepository extends JpaRepository<VendorPayout, Long> {

    Optional<VendorPayout> findById(Long id);
    List<VendorPayout> findByStatus(PaymentStatus status);
    Page<VendorPayout> findByStatus(PaymentStatus status, Pageable pageable);
    long countByStatus(PaymentStatus status);
    List<VendorPayout> findAllByVendor(VendorProfile vendor);
    Page<VendorPayout> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}