package com.bidzo.repository;

import com.bidzo.entity.CmsSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CmsSectionRepository extends JpaRepository<CmsSection, Long> {
}
