package com.bidzo.repository;

import com.bidzo.entity.Address;
import com.bidzo.entity.CustomerProfile;
import com.bidzo.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {

    Optional<CustomerProfile> findById(Long id);
    Optional<CustomerProfile> findByPhone(String phone);
    boolean existsByPhone(String phone);
    List<CustomerProfile> findAllByUser(User user);
    Page<CustomerProfile> findAllByUser(User user, Pageable pageable);
    long countByUser(User user);
    List<CustomerProfile> findAllByAddress(Address address);
    Page<CustomerProfile> findAllByAddress(Address address, Pageable pageable);
    long countByAddress(Address address);
}