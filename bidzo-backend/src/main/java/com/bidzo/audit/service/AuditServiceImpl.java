package com.bidzo.audit.service;

import org.springframework.stereotype.Service;
import com.bidzo.audit.AuditLogRepository;
import com.bidzo.audit.entity.AuditLog;

@Service
public class AuditServiceImpl implements AuditService {

    private final AuditLogRepository repository;

    public AuditServiceImpl(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Override
    public void logCreation(String entityName, String entityId, String username, String details) {
        // TODO: create and persist creation audit
        AuditLog log = new AuditLog();
        log.setEventType("CREATE");
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public void logUpdate(String entityName, String entityId, String username, String details) {
        // TODO: create and persist update audit
        AuditLog log = new AuditLog();
        log.setEventType("UPDATE");
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public void logDelete(String entityName, String entityId, String username, String details) {
        // TODO: create and persist delete audit
        AuditLog log = new AuditLog();
        log.setEventType("DELETE");
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public void logLogin(String username, String details) {
        // TODO: log login event
        AuditLog log = new AuditLog();
        log.setEventType("LOGIN");
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public void logLogout(String username, String details) {
        // TODO: log logout event
        AuditLog log = new AuditLog();
        log.setEventType("LOGOUT");
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public void logPayment(String paymentId, String username, String details) {
        // TODO: log payment event
        AuditLog log = new AuditLog();
        log.setEventType("PAYMENT");
        log.setEntityName("Payment");
        log.setEntityId(paymentId);
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public void logAuction(String auctionId, String username, String details) {
        // TODO: log auction event
        AuditLog log = new AuditLog();
        log.setEventType("AUCTION");
        log.setEntityName("Auction");
        log.setEntityId(auctionId);
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public void logOrder(String orderId, String username, String details) {
        // TODO: log order event
        AuditLog log = new AuditLog();
        log.setEventType("ORDER");
        log.setEntityName("Order");
        log.setEntityId(orderId);
        log.setUsername(username);
        log.setDetails(details);
        repository.save(log);
    }

    @Override
    public AuditLog save(AuditLog auditLog) {
        return repository.save(auditLog);
    }
}
