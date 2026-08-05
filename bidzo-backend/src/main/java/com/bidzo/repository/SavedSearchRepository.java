package com.bidzo.repository;

import com.bidzo.entity.SavedSearch;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {

    Optional<SavedSearch> findById(Long id);
    List<SavedSearch> findAllByUser(User user);
    Page<SavedSearch> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}