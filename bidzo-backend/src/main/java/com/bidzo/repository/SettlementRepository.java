package com.bidzo.repository;

import com.bidzo.entity.Settlement;
import com.bidzo.entity.VendorProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    Optional<Settlement> findById(Long id);
    List<Settlement> findAllByVendor(VendorProfile vendor);
    Page<Settlement> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}