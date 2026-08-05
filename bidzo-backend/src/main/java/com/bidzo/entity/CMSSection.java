package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cms_section")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CMSSection extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key", length = 128, nullable = false, unique = true)
    private String key;

    @Column(name = "title", length = 256)
    private String title;

    @Column(name = "description", length = 1024)
    private String description;
}
