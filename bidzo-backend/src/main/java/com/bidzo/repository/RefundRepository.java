package com.bidzo.repository;

import com.bidzo.entity.Refund;
import com.bidzo.enums.RefundStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    Optional<Refund> findById(Long id);
    List<Refund> findByStatus(RefundStatus status);
    Page<Refund> findByStatus(RefundStatus status, Pageable pageable);
    long countByStatus(RefundStatus status);
}