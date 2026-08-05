package com.bidzo.repository;

import com.bidzo.entity.Product;
import com.bidzo.entity.RecentlyViewed;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecentlyViewedRepository extends JpaRepository<RecentlyViewed, Long> {

    Optional<RecentlyViewed> findById(Long id);
    List<RecentlyViewed> findAllByUser(User user);
    Page<RecentlyViewed> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
    List<RecentlyViewed> findAllByProduct(Product product);
    Page<RecentlyViewed> findAllByProduct(Product product, Pageable pageable);
    long countByProduct(Product product);
}