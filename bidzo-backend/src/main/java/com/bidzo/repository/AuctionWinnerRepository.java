package com.bidzo.repository;

import com.bidzo.entity.Auction;
import com.bidzo.entity.AuctionWinner;
import com.bidzo.entity.Bid;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuctionWinnerRepository extends JpaRepository<AuctionWinner, Long> {

    Optional<AuctionWinner> findById(Long id);
    List<AuctionWinner> findAllByAuction(Auction auction);
    Page<AuctionWinner> findAllByAuction(Auction auction, Pageable pageable);
    long countByAuction(Auction auction);
    List<AuctionWinner> findAllByWinningBid(Bid winningBid);
    Page<AuctionWinner> findAllByWinningBid(Bid winningBid, Pageable pageable);
    long countByWinningBid(Bid winningBid);
    List<AuctionWinner> findAllByWinner(User winner);
    Page<AuctionWinner> findAllByWinner(User winner, Pageable pageable);
    long countByWinner(User winner);
}