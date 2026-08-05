package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "bid_history", indexes = {@Index(columnList = "bid_id")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BidHistory extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    private BigDecimal previousAmount;
    private OffsetDateTime changedAt;
    private String reason;
}
