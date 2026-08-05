package com.bidzo.repository;

import com.bidzo.entity.SupportAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportAttachmentRepository extends JpaRepository<SupportAttachment, Long> {
}
