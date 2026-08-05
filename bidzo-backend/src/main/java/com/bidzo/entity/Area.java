package com.bidzo.entity;

import com.bidzo.common.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "areas", indexes = {@Index(columnList = "name")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Area extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;
}
