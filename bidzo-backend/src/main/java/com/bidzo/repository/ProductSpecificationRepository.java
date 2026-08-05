package com.bidzo.repository;

import com.bidzo.entity.Product;
import com.bidzo.entity.ProductSpecification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductSpecificationRepository extends JpaRepository<ProductSpecification, Long> {

    Optional<ProductSpecification> findById(Long id);
    List<ProductSpecification> findAllByProduct(Product product);
    Page<ProductSpecification> findAllByProduct(Product product, Pageable pageable);
    long countByProduct(Product product);
}