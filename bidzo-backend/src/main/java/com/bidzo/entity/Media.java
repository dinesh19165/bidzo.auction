package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "media", indexes = {
        @Index(name = "idx_media_type", columnList = "media_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", length = 32)
    private com.bidzo.enums.MediaType mediaType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileStorage file;

    @Column(name = "alt_text", length = 256)
    private String altText;

    @Column(name = "title", length = 256)
    private String title;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "published")
    private Boolean published = true;
}
