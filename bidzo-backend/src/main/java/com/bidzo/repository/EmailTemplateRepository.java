package com.bidzo.repository;

import com.bidzo.entity.EmailTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {

    Optional<EmailTemplate> findById(Long id);
    Optional<EmailTemplate> findByKey(String key);
    boolean existsByKey(String key);
}