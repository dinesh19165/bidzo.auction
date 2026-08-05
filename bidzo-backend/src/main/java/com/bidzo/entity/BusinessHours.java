package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "business_hours", indexes = {
        @Index(name = "idx_business_hours_vendor", columnList = "vendor_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessHours extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private VendorProfile vendor;

    @Column(name = "day_of_week", length = 16)
    private String dayOfWeek;

    @Column(name = "open_time", length = 16)
    private String openTime;

    @Column(name = "close_time", length = 16)
    private String closeTime;

    @Column(name = "closed")
    private Boolean closed = false;
}
