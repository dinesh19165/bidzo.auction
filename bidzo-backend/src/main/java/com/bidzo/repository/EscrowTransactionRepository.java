package com.bidzo.repository;

import com.bidzo.entity.EscrowTransaction;
import com.bidzo.enums.EscrowStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EscrowTransactionRepository extends JpaRepository<EscrowTransaction, Long> {

    Optional<EscrowTransaction> findById(Long id);
    List<EscrowTransaction> findByStatus(EscrowStatus status);
    Page<EscrowTransaction> findByStatus(EscrowStatus status, Pageable pageable);
    long countByStatus(EscrowStatus status);
}