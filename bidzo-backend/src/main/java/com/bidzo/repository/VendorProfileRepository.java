package com.bidzo.repository;

import com.bidzo.entity.Franchise;
import com.bidzo.entity.User;
import com.bidzo.entity.VendorProfile;
import com.bidzo.enums.VendorStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorProfileRepository extends JpaRepository<VendorProfile, Long> {

    Optional<VendorProfile> findById(Long id);
    List<VendorProfile> findByStatus(VendorStatus status);
    Page<VendorProfile> findByStatus(VendorStatus status, Pageable pageable);
    long countByStatus(VendorStatus status);
    List<VendorProfile> findAllByUser(User user);
    Page<VendorProfile> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
    List<VendorProfile> findAllByFranchise(Franchise franchise);
    Page<VendorProfile> findAllByFranchise(Franchise franchise, Pageable pageable);
    long countByFranchise(Franchise franchise);
}