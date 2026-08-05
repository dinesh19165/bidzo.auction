package com.bidzo.audit.service;

import com.bidzo.audit.entity.AuditLog;

public interface AuditService {
    void logCreation(String entityName, String entityId, String username, String details);
    void logUpdate(String entityName, String entityId, String username, String details);
    void logDelete(String entityName, String entityId, String username, String details);
    void logLogin(String username, String details);
    void logLogout(String username, String details);
    void logPayment(String paymentId, String username, String details);
    void logAuction(String auctionId, String username, String details);
    void logOrder(String orderId, String username, String details);
    AuditLog save(AuditLog auditLog);
}
