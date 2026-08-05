package com.bidzo.repository;

import com.bidzo.entity.ReturnRequest;
import com.bidzo.entity.User;
import com.bidzo.enums.com.bidzo.enums.ReturnStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    Optional<ReturnRequest> findById(Long id);
    List<ReturnRequest> findByStatus(com.bidzo.enums.ReturnStatus status);
    Page<ReturnRequest> findByStatus(com.bidzo.enums.ReturnStatus status, Pageable pageable);
    long countByStatus(com.bidzo.enums.ReturnStatus status);
    List<ReturnRequest> findAllByUser(User user);
    Page<ReturnRequest> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}