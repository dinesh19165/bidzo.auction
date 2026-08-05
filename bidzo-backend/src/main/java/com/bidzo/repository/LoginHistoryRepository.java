package com.bidzo.repository;

import com.bidzo.entity.LoginHistory;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    Optional<LoginHistory> findById(Long id);
    List<LoginHistory> findAllByUser(User user);
    Page<LoginHistory> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}