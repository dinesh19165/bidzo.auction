package com.bidzo.repository;

import com.bidzo.entity.PageSEO;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PageSEORepository extends JpaRepository<PageSEO, Long> {

    Optional<PageSEO> findById(Long id);
}