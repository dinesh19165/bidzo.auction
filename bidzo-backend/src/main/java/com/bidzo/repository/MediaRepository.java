package com.bidzo.repository;

import com.bidzo.entity.FileStorage;
import com.bidzo.entity.Media;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

    Optional<Media> findById(Long id);
    List<Media> findAllByFile(FileStorage file);
    Page<Media> findAllByFile(FileStorage file, Pageable pageable);
    long countByFile(FileStorage file);
}