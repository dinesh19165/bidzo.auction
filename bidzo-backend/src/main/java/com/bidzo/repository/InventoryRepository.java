package com.bidzo.repository;

import com.bidzo.entity.Inventory;
import com.bidzo.entity.ProductVariant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findById(Long id);
    List<Inventory> findAllByVariant(ProductVariant variant);
    Page<Inventory> findAllByVariant(ProductVariant variant, Pageable pageable);
    long countByVariant(ProductVariant variant);
}