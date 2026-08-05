package com.bidzo.repository;

import com.bidzo.entity.Product;
import com.bidzo.entity.ProductVariant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    Optional<ProductVariant> findById(Long id);
    List<ProductVariant> findAllByProduct(Product product);
    Page<ProductVariant> findAllByProduct(Product product, Pageable pageable);
    long countByProduct(Product product);
}