package com.bidzo.repository;

import com.bidzo.entity.VendorProfile;
import com.bidzo.entity.VendorSubscription;
import com.bidzo.enums.CommonStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorSubscriptionRepository extends JpaRepository<VendorSubscription, Long> {

    Optional<VendorSubscription> findById(Long id);
    List<VendorSubscription> findByStatus(CommonStatus status);
    Page<VendorSubscription> findByStatus(CommonStatus status, Pageable pageable);
    long countByStatus(CommonStatus status);
    List<VendorSubscription> findAllByVendor(VendorProfile vendor);
    Page<VendorSubscription> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}