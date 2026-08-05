package com.bidzo.repository;

import com.bidzo.entity.VendorDocument;
import com.bidzo.entity.VendorProfile;
import com.bidzo.enums.KycStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorDocumentRepository extends JpaRepository<VendorDocument, Long> {

    Optional<VendorDocument> findById(Long id);
    List<VendorDocument> findByStatus(KycStatus status);
    Page<VendorDocument> findByStatus(KycStatus status, Pageable pageable);
    long countByStatus(KycStatus status);
    List<VendorDocument> findAllByVendor(VendorProfile vendor);
    Page<VendorDocument> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}