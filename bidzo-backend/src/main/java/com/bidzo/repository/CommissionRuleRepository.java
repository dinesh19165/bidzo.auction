package com.bidzo.repository;

import com.bidzo.entity.CommissionRule;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommissionRuleRepository extends JpaRepository<CommissionRule, Long> {

    Optional<CommissionRule> findById(Long id);
}