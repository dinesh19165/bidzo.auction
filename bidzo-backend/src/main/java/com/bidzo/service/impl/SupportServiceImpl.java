package com.bidzo.service.impl;

import com.bidzo.dto.support.*;
import com.bidzo.repository.SupportAttachmentRepository;
import com.bidzo.repository.SupportTicketRepository;
import com.bidzo.service.SupportService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SupportServiceImpl implements SupportService {

    private final SupportTicketRepository supportTicketRepository;
    private final SupportAttachmentRepository supportAttachmentRepository;

    public SupportServiceImpl(SupportTicketRepository supportTicketRepository, SupportAttachmentRepository supportAttachmentRepository) {
        this.supportTicketRepository = supportTicketRepository;
        this.supportAttachmentRepository = supportAttachmentRepository;
    }

    @Override
    public SupportResponseDto create(SupportCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public SupportResponseDto reply(SupportUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public SupportDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<SupportSummaryDto> getTicketsByUser(Long userId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<SupportSummaryDto> search(SupportSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<SupportSummaryDto> filter(SupportFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
