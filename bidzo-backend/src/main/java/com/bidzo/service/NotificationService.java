package com.bidzo.service;

import com.bidzo.dto.notification.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface NotificationService {

    NotificationResponseDto create(NotificationCreateDto createDto);
    NotificationDetailsDto getById(Long id);
    List<NotificationSummaryDto> getForUser(Long userId);
    List<NotificationSummaryDto> search(NotificationSearchDto searchDto);
    List<NotificationSummaryDto> filter(NotificationFilterDto filterDto);
}
