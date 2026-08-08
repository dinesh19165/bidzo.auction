package com.bidzo.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bidzo.audit.entity.AuditLog;

@Repository("auditLogRepositoryAudit")
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Spring Data JPA repository - no implementation required
}
