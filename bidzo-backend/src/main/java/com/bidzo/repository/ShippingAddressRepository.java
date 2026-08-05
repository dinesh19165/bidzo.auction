package com.bidzo.repository;

import com.bidzo.entity.ShippingAddress;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShippingAddressRepository extends JpaRepository<ShippingAddress, Long> {

    Optional<ShippingAddress> findById(Long id);
    Optional<ShippingAddress> findByPhone(String phone);
    boolean existsByPhone(String phone);
    List<ShippingAddress> findAllByUser(User user);
    Page<ShippingAddress> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
}