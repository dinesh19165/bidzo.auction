package com.bidzo.repository;

import com.bidzo.entity.PushTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PushTemplateRepository extends JpaRepository<PushTemplate, Long> {

    Optional<PushTemplate> findById(Long id);
    Optional<PushTemplate> findByKey(String key);
    boolean existsByKey(String key);
}