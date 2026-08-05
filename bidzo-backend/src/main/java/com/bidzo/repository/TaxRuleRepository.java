package com.bidzo.repository;

import com.bidzo.entity.TaxRule;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxRuleRepository extends JpaRepository<TaxRule, Long> {

    Optional<TaxRule> findById(Long id);
    Optional<TaxRule> findByCode(String code);
    boolean existsByCode(String code);
}