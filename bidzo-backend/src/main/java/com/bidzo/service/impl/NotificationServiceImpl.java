package com.bidzo.service.impl;

import com.bidzo.dto.notification.*;
import com.bidzo.repository.NotificationRepository;
import com.bidzo.service.NotificationService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public NotificationResponseDto create(NotificationCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public NotificationDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<NotificationSummaryDto> getForUser(Long userId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<NotificationSummaryDto> search(NotificationSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<NotificationSummaryDto> filter(NotificationFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
