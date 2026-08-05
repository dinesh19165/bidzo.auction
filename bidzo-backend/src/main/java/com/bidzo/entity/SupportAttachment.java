package com.bidzo.entity;

import com.bidzo.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "support_attachment", indexes = {
        @Index(name = "idx_support_attachment_ticket", columnList = "ticket_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportAttachment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id")
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileStorage file;
}
