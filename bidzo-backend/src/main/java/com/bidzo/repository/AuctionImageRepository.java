package com.bidzo.repository;

import com.bidzo.entity.Auction;
import com.bidzo.entity.AuctionImage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionImageRepository extends JpaRepository<AuctionImage, Long> {

    Optional<AuctionImage> findById(Long id);
    List<AuctionImage> findAllByAuction(Auction auction);
    Page<AuctionImage> findAllByAuction(Auction auction, Pageable pageable);
    long countByAuction(Auction auction);
}