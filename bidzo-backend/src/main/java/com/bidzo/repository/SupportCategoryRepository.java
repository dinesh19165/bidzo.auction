package com.bidzo.repository;

import com.bidzo.entity.SupportCategory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportCategoryRepository extends JpaRepository<SupportCategory, Long> {

    Optional<SupportCategory> findById(Long id);
}