package com.bidzo.repository;

import com.bidzo.entity.CMSComponent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CMSComponentRepository extends JpaRepository<CMSComponent, Long> {
}
