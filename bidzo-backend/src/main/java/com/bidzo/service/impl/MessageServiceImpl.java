package com.bidzo.service.impl;

import com.bidzo.dto.message.*;
import com.bidzo.repository.MessageRepository;
import com.bidzo.service.MessageService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;

    public MessageServiceImpl(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Override
    public MessageResponseDto send(MessageCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public MessageDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<MessageSummaryDto> getConversationMessages(Long conversationId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<MessageSummaryDto> search(MessageSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<MessageSummaryDto> filter(MessageFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
