package com.bidzo.repository;

import com.bidzo.entity.CategoryAttribute;
import com.bidzo.entity.CategoryAttributeValue;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryAttributeValueRepository extends JpaRepository<CategoryAttributeValue, Long> {

    Optional<CategoryAttributeValue> findById(Long id);
    List<CategoryAttributeValue> findAllByAttribute(CategoryAttribute attribute);
    Page<CategoryAttributeValue> findAllByAttribute(CategoryAttribute attribute, Pageable pageable);
    long countByAttribute(CategoryAttribute attribute);
}