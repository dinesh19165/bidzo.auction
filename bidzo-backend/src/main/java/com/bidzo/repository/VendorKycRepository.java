package com.bidzo.repository;

import com.bidzo.entity.VendorKyc;
import com.bidzo.entity.VendorProfile;
import com.bidzo.enums.KycStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorKycRepository extends JpaRepository<VendorKyc, Long> {

    Optional<VendorKyc> findById(Long id);
    List<VendorKyc> findByStatus(KycStatus status);
    Page<VendorKyc> findByStatus(KycStatus status, Pageable pageable);
    long countByStatus(KycStatus status);
    List<VendorKyc> findAllByVendor(VendorProfile vendor);
    Page<VendorKyc> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}