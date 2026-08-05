package com.bidzo.repository;

import com.bidzo.entity.Category;
import com.bidzo.entity.CategoryAttribute;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryAttributeRepository extends JpaRepository<CategoryAttribute, Long> {

    Optional<CategoryAttribute> findById(Long id);
    List<CategoryAttribute> findAllByCategory(Category category);
    Page<CategoryAttribute> findAllByCategory(Category category, Pageable pageable);
    long countByCategory(Category category);
}