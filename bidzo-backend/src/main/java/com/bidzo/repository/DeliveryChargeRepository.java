package com.bidzo.repository;

import com.bidzo.entity.DeliveryCharge;
import com.bidzo.entity.DeliveryZone;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeliveryChargeRepository extends JpaRepository<DeliveryCharge, Long> {

    Optional<DeliveryCharge> findById(Long id);
    List<DeliveryCharge> findAllByZone(DeliveryZone zone);
    Page<DeliveryCharge> findAllByZone(DeliveryZone zone, Pageable pageable);
    long countByZone(DeliveryZone zone);
}