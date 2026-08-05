package com.bidzo.repository;

import com.bidzo.entity.SmsTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmsTemplateRepository extends JpaRepository<SmsTemplate, Long> {

    Optional<SmsTemplate> findById(Long id);
    Optional<SmsTemplate> findByKey(String key);
    boolean existsByKey(String key);
}