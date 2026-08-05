package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shipping_address", indexes = {
        @Index(name = "idx_shipping_address_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "address_line1", length = 256)
    private String addressLine1;

    @Column(name = "address_line2", length = 256)
    private String addressLine2;

    @Column(name = "city", length = 128)
    private String city;

    @Column(name = "state", length = 128)
    private String state;

    @Column(name = "postal_code", length = 32)
    private String postalCode;

    @Column(name = "country", length = 128)
    private String country;

    @Column(name = "phone", length = 32)
    private String phone;
}
