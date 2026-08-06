package com.bidzo.repository;

import com.bidzo.entity.PageSEO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CmsPageRepository extends JpaRepository<PageSEO, Long> {
}
