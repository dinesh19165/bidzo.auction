package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "device_session", indexes = {
        @Index(name = "idx_device_session_token", columnList = "session_token")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceSession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "device_info", length = 512)
    private String deviceInfo;

    @Column(name = "session_token", length = 512, nullable = false, unique = true)
    private String sessionToken;

    @Column(name = "expires_at")
    private OffsetDateTime expiresAt;
}
