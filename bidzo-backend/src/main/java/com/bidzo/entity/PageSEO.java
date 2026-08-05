package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "page_seo", indexes = {
        @Index(name = "idx_page_seo_page", columnList = "page_key", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageSEO extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "page_key", length = 256, nullable = false)
    private String pageKey;

    @Column(name = "title", length = 256)
    private String title;

    @Column(name = "description", length = 512)
    private String description;
}
