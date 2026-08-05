package com.bidzo.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bidzo.audit.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Spring Data JPA repository - no implementation required
}
