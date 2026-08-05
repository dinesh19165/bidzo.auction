package com.bidzo.repository;

import com.bidzo.entity.Promotion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Optional<Promotion> findById(Long id);
    Optional<Promotion> findByCode(String code);
    boolean existsByCode(String code);
}