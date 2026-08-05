package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "vendor_holiday", indexes = {
        @Index(name = "idx_vendor_holiday_vendor", columnList = "vendor_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorHoliday extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private VendorProfile vendor;

    @Column(name = "holiday_date")
    private LocalDate holidayDate;

    @Column(name = "description", length = 512)
    private String description;
}
