package com.bidzo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.bidzo.common.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String couponCode;

    private String couponName;

    private String description;

    private BigDecimal discountValue;

    private String discountType;

    private BigDecimal minimumOrderAmount;

    private BigDecimal maximumDiscountAmount;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private Boolean active;
}