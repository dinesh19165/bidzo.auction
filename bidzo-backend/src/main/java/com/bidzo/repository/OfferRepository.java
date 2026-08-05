package com.bidzo.repository;

import com.bidzo.entity.Offer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    Optional<Offer> findById(Long id);
    Optional<Offer> findByCode(String code);
    boolean existsByCode(String code);
}