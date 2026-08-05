package com.bidzo.repository;

import com.bidzo.entity.DeviceSession;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeviceSessionRepository extends JpaRepository<DeviceSession, Long> {

    Optional<DeviceSession> findById(Long id);
    List<DeviceSession> findAllByUser(User user);
    Page<DeviceSession> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}