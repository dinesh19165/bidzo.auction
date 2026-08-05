package com.bidzo.audit.listener;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.PreRemove;

public class AuditListener {

    @PrePersist
    public void prePersist(Object entity) {
        // TODO: handle entity creation audit (called before entity is persisted)
    }

    @PreUpdate
    public void preUpdate(Object entity) {
        // TODO: handle entity update audit (called before entity is updated)
    }

    @PreRemove
    public void preRemove(Object entity) {
        // TODO: handle entity delete audit (called before entity is removed)
    }
}
