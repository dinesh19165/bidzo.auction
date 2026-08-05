package com.bidzo.repository;

import com.bidzo.entity.CmsComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CmsComponentRepository extends JpaRepository<CmsComponent, Long> {
}
