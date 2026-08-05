package com.bidzo.repository;

import com.bidzo.entity.CouponUsage;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {

    Optional<CouponUsage> findById(Long id);
    Optional<CouponUsage> findByOrderReference(String orderReference);
    boolean existsByOrderReference(String orderReference);
    List<CouponUsage> findAllByUser(User user);
    Page<CouponUsage> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}