package com.bidzo.repository;

import com.bidzo.entity.VendorHoliday;
import com.bidzo.entity.VendorProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorHolidayRepository extends JpaRepository<VendorHoliday, Long> {

    Optional<VendorHoliday> findById(Long id);
    List<VendorHoliday> findAllByVendor(VendorProfile vendor);
    Page<VendorHoliday> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}