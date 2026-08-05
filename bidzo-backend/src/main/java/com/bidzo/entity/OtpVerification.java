package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "otp_verification", indexes = {
        @Index(name = "idx_otp_verification_mobile", columnList = "mobile_number")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mobile_number", length = 32, nullable = false)
    private String mobileNumber;

    @Column(name = "otp_code", length = 16, nullable = false)
    private String otpCode;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;

    @Column(name = "attempts")
    private Integer attempts = 0;

    @Column(name = "verified")
    private Boolean verified = false;
}
