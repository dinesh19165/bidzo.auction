package com.bidzo.repository;

import com.bidzo.entity.CMSSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CMSSectionRepository extends JpaRepository<CMSSection, Long> {
}
