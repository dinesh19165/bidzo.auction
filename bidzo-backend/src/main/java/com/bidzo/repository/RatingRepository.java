package com.bidzo.repository;

import com.bidzo.entity.Product;
import com.bidzo.entity.Rating;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findById(Long id);
    List<Rating> findAllByProduct(Product product);
    Page<Rating> findAllByProduct(Product product, Pageable pageable);
    long countByProduct(Product product);
    List<Rating> findAllByUser(User user);
    Page<Rating> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}