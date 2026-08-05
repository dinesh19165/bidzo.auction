package com.bidzo.repository;

import com.bidzo.entity.BannerPosition;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BannerPositionRepository extends JpaRepository<BannerPosition, Long> {

    Optional<BannerPosition> findById(Long id);
}