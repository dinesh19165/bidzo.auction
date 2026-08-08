package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog extends BaseEntity {

    private Long id;
    private String entityName;
    private Long entityId;
    private String action;
    private String performedBy;
    private String details;
}
