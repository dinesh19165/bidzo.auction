package com.bidzo.repository;

import com.bidzo.entity.User;
import com.bidzo.entity.Watchlist;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    Optional<Watchlist> findById(Long id);
    List<Watchlist> findAllByUser(User user);
    Page<Watchlist> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}