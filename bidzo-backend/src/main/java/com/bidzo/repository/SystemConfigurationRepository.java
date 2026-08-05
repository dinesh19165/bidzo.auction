package com.bidzo.repository;

import com.bidzo.entity.SystemConfiguration;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemConfigurationRepository extends JpaRepository<SystemConfiguration, Long> {

    Optional<SystemConfiguration> findById(Long id);
    Optional<SystemConfiguration> findByKey(String key);
    boolean existsByKey(String key);
}