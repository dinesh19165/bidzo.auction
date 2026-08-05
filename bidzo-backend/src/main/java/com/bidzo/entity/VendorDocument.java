package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import com.bidzo.enums.DocumentType;
import com.bidzo.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vendor_documents", indexes = {@Index(columnList = "vendor_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDocument extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private VendorProfile vendor;

    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    private String documentNumber;
    private String url;
    private String fileName;

    @Enumerated(EnumType.STRING)
    private KycStatus status;

    private String remarks;
}
