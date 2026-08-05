package com.bidzo.repository;

import com.bidzo.entity.SearchHistory;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    Optional<SearchHistory> findById(Long id);
    List<SearchHistory> findAllByUser(User user);
    Page<SearchHistory> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}