package com.bidzo.entity;

import com.bidzo.common.BaseEntity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category_attribute_values")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryAttributeValue extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String value;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attribute_id")
    private CategoryAttribute attribute;
}
