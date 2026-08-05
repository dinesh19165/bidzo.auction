package com.bidzo.repository;

import com.bidzo.entity.RevenueShare;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevenueShareRepository extends JpaRepository<RevenueShare, Long> {

    Optional<RevenueShare> findById(Long id);
}