package com.bidzo.repository;

import com.bidzo.entity.NotificationTemplate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {

    Optional<NotificationTemplate> findById(Long id);
    Optional<NotificationTemplate> findByKey(String key);
    boolean existsByKey(String key);
}