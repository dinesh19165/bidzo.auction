package com.bidzo.repository;

import com.bidzo.entity.Shipping;
import com.bidzo.enums.DeliveryStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingRepository extends JpaRepository<Shipping, Long> {

    Optional<Shipping> findById(Long id);
    List<Shipping> findByStatus(DeliveryStatus status);
    Page<Shipping> findByStatus(DeliveryStatus status, Pageable pageable);
    long countByStatus(DeliveryStatus status);
}