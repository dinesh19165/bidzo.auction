package com.bidzo.repository;

import com.bidzo.entity.SEOSetting;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SEOSettingRepository extends JpaRepository<SEOSetting, Long> {

    Optional<SEOSetting> findById(Long id);
}