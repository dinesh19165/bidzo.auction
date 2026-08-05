package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Notification;
import com.bidzo.dto.notification.NotificationCreateDto;
import com.bidzo.dto.notification.NotificationDetailsDto;
import com.bidzo.dto.notification.NotificationResponseDto;
import com.bidzo.dto.notification.NotificationUpdateDto;
import com.bidzo.dto.notification.NotificationSummaryDto;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    Notification toEntity(NotificationCreateDto dto);
    NotificationDetailsDto toDetailsDto(Notification entity);
    NotificationResponseDto toResponseDto(Notification entity);
    NotificationSummaryDto toSummaryDto(Notification entity);
    void updateFromDto(NotificationUpdateDto dto, @MappingTarget Notification entity);
}
