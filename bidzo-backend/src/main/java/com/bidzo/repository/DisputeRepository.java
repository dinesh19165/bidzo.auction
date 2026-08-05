package com.bidzo.repository;

import com.bidzo.entity.Dispute;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {

    Optional<Dispute> findById(Long id);
    List<Dispute> findAllByUser(User user);
    Page<Dispute> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}