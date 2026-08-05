package com.bidzo.entity;

import com.bidzo.common.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "cities", indexes = {@Index(columnList = "name")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class City extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Area> areas = new HashSet<>();

    public void addArea(Area a) {
        areas.add(a);
        a.setCity(this);
    }

    public void removeArea(Area a) {
        areas.remove(a);
        a.setCity(null);
    }
}

