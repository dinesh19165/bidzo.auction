package com.bidzo.repository;

import com.bidzo.entity.VendorProfile;
import com.bidzo.entity.WithdrawalRequest;
import com.bidzo.enums.PaymentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {

    Optional<WithdrawalRequest> findById(Long id);
    List<WithdrawalRequest> findByStatus(PaymentStatus status);
    Page<WithdrawalRequest> findByStatus(PaymentStatus status, Pageable pageable);
    long countByStatus(PaymentStatus status);
    List<WithdrawalRequest> findAllByVendor(VendorProfile vendor);
    Page<WithdrawalRequest> findAllByVendor(VendorProfile vendor, Pageable pageable);
    long countByVendor(VendorProfile vendor);
}