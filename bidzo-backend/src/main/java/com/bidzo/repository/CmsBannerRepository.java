package com.bidzo.repository;

import com.bidzo.entity.CmsBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CmsBannerRepository extends JpaRepository<CmsBanner, Long> {
}
