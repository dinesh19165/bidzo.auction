package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cms_component")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CMSComponent extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private CMSSection section;

    @Column(name = "component_key", length = 128)
    private String componentKey;

    @Column(name = "data", columnDefinition = "TEXT")
    private String data;
}
