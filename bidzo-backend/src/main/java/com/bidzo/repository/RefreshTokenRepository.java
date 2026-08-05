package com.bidzo.repository;

import com.bidzo.entity.RefreshToken;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findById(Long id);
    Optional<RefreshToken> findByToken(String token);
    boolean existsByToken(String token);
    List<RefreshToken> findAllByUser(User user);
    Page<RefreshToken> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}