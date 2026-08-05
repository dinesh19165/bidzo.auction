package com.bidzo.entity;

import com.bidzo.common.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "countries", indexes = {@Index(columnList = "code"), @Index(columnList = "name")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Country extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 8)
    private String code; // ISO code

    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "country", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<State> states = new HashSet<>();

    public void addState(State s) {
        states.add(s);
        s.setCountry(this);
    }

    public void removeState(State s) {
        states.remove(s);
        s.setCountry(null);
    }
}
