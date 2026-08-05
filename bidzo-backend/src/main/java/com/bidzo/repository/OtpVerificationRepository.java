package com.bidzo.repository;

import com.bidzo.entity.OtpVerification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findById(Long id);
    Optional<OtpVerification> findByMobileNumber(String mobileNumber);
    boolean existsByMobileNumber(String mobileNumber);
}