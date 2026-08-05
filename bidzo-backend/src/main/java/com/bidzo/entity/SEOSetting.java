package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seo_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SEOSetting extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meta_title", length = 256)
    private String metaTitle;

    @Column(name = "meta_description", length = 512)
    private String metaDescription;

    @Column(name = "meta_keywords", length = 512)
    private String metaKeywords;
}
