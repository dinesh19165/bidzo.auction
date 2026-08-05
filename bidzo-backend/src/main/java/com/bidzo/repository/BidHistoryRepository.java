package com.bidzo.repository;

import com.bidzo.entity.Bid;
import com.bidzo.entity.BidHistory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BidHistoryRepository extends JpaRepository<BidHistory, Long> {

    Optional<BidHistory> findById(Long id);
    List<BidHistory> findAllByBid(Bid bid);
    Page<BidHistory> findAllByBid(Bid bid, Pageable pageable);
    long countByBid(Bid bid);
}