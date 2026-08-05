package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_configuration", indexes = {
        @Index(name = "idx_system_configuration_key", columnList = "config_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfiguration extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", length = 128, nullable = false)
    private String key;

    @Column(name = "config_value", length = 2048)
    private String value;

    @Column(name = "description", length = 512)
    private String description;
}
