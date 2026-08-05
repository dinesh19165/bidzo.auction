package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notification_template", indexes = {
        @Index(name = "idx_notification_template_type", columnList = "template_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_key", length = 128, nullable = false, unique = true)
    private String key;

    @Enumerated(EnumType.STRING)
    @Column(name = "template_type", length = 32, nullable = false)
    private com.bidzo.enums.TemplateType templateType;

    @Column(name = "subject", length = 256)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;
}
