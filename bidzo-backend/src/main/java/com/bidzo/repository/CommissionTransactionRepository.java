package com.bidzo.repository;

import com.bidzo.entity.CommissionRule;
import com.bidzo.entity.CommissionTransaction;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommissionTransactionRepository extends JpaRepository<CommissionTransaction, Long> {

    Optional<CommissionTransaction> findById(Long id);
    List<CommissionTransaction> findAllByRule(CommissionRule rule);
    Page<CommissionTransaction> findAllByRule(CommissionRule rule, Pageable pageable);
    long countByRule(CommissionRule rule);
}