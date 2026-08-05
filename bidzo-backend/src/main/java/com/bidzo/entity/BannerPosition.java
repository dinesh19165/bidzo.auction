package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "banner_position", indexes = {
        @Index(name = "idx_banner_position_key", columnList = "position_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BannerPosition extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "position_key", length = 128, nullable = false)
    private String positionKey;

    @Column(name = "description", length = 512)
    private String description;
}
