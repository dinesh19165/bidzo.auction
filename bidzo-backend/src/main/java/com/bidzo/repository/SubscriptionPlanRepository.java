package com.bidzo.repository;

import com.bidzo.entity.SubscriptionPlan;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {

    Optional<SubscriptionPlan> findById(Long id);
    Optional<SubscriptionPlan> findByCode(String code);
    boolean existsByCode(String code);
}