package com.bidzo.repository;

import com.bidzo.entity.ChatAttachment;
import com.bidzo.entity.FileStorage;
import com.bidzo.entity.Message;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatAttachmentRepository extends JpaRepository<ChatAttachment, Long> {

    Optional<ChatAttachment> findById(Long id);
    List<ChatAttachment> findAllByMessage(Message message);
    Page<ChatAttachment> findAllByMessage(Message message, Pageable pageable);
    long countByMessage(Message message);
    List<ChatAttachment> findAllByFile(FileStorage file);
    Page<ChatAttachment> findAllByFile(FileStorage file, Pageable pageable);
    long countByFile(FileStorage file);
}