package com.bidzo.service;

import com.bidzo.dto.message.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface MessageService {

    MessageResponseDto send(MessageCreateDto createDto);
    MessageDetailsDto getById(Long id);
    List<MessageSummaryDto> getConversationMessages(Long conversationId);
    List<MessageSummaryDto> search(MessageSearchDto searchDto);
    List<MessageSummaryDto> filter(MessageFilterDto filterDto);
}
