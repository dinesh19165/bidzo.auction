package com.bidzo.repository;

import com.bidzo.entity.Permission;
import com.bidzo.entity.Role;
import com.bidzo.entity.RolePermission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    Optional<RolePermission> findById(Long id);
    List<RolePermission> findAllByRole(Role role);
    Page<RolePermission> findAllByRole(Role role, Pageable pageable);
    long countByRole(Role role);
    List<RolePermission> findAllByPermission(Permission permission);
    Page<RolePermission> findAllByPermission(Permission permission, Pageable pageable);
    long countByPermission(Permission permission);
}