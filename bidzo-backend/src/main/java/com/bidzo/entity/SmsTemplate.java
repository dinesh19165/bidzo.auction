package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sms_template", indexes = {
        @Index(name = "idx_sms_template_key", columnList = "template_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_key", length = 128, nullable = false)
    private String key;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
}
