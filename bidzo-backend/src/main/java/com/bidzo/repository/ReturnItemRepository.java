package com.bidzo.repository;

import com.bidzo.entity.OrderItem;
import com.bidzo.entity.ReturnItem;
import com.bidzo.entity.ReturnRequest;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReturnItemRepository extends JpaRepository<ReturnItem, Long> {

    Optional<ReturnItem> findById(Long id);
    List<ReturnItem> findAllByReturnRequest(ReturnRequest returnRequest);
    Page<ReturnItem> findAllByReturnRequest(ReturnRequest returnRequest, Pageable pageable);
    long countByReturnRequest(ReturnRequest returnRequest);
    List<ReturnItem> findAllByOrderItem(OrderItem orderItem);
    Page<ReturnItem> findAllByOrderItem(OrderItem orderItem, Pageable pageable);
    long countByOrderItem(OrderItem orderItem);
}