package com.bidzo.entity;

import com.bidzo.common.BaseEntity;

import com.bidzo.enums.AuctionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "auctions", indexes = {@Index(columnList = "title"), @Index(columnList = "startAt,endAt")})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auction extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    private OffsetDateTime startAt;
    private OffsetDateTime endAt;

    private BigDecimal startingPrice;

    @Enumerated(EnumType.STRING)
    private AuctionStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id")
    private VendorProfile vendor;

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<AuctionImage> images = new HashSet<>();

    @OneToMany(mappedBy = "auction", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Bid> bids = new HashSet<>();

    public void addImage(AuctionImage img) { images.add(img); img.setAuction(this); }
    public void addBid(Bid b) { bids.add(b); b.setAuction(this); }
}
