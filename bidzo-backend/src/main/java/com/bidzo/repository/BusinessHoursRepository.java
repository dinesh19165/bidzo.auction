package com.bidzo.repository;

import com.bidzo.entity.BusinessHours;
import com.bidzo.entity.VendorProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {

    Optional<BusinessHours> findById(Long id);
    List<BusinessHours> findAllByVendor(VendorProfile vendor);
    Page<BusinessHours> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}