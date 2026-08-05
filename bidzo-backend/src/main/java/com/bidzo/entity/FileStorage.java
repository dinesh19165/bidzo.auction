package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "file_storage", indexes = {
        @Index(name = "idx_file_storage_path", columnList = "path")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileStorage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "path", length = 1024, nullable = false)
    private String path;

    @Column(name = "filename", length = 512)
    private String filename;

    @Column(name = "content_type", length = 128)
    private String contentType;

    @Column(name = "size")
    private Long size;

    @Column(name = "uploaded_at")
    private OffsetDateTime uploadedAt;
}
