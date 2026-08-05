package com.bidzo.service;

import com.bidzo.dto.support.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface SupportService {

    SupportResponseDto create(SupportCreateDto createDto);
    SupportResponseDto reply(SupportUpdateDto updateDto);
    SupportDetailsDto getById(Long id);
    List<SupportSummaryDto> getTicketsByUser(Long userId);
    List<SupportSummaryDto> search(SupportSearchDto searchDto);
    List<SupportSummaryDto> filter(SupportFilterDto filterDto);
}
