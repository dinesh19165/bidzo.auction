package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "push_template", indexes = {
        @Index(name = "idx_push_template_key", columnList = "template_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PushTemplate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_key", length = 128, nullable = false)
    private String key;

    @Column(name = "title", length = 256)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
}
