package com.bidzo.mapper;

import com.bidzo.dto.notification.NotificationCreateDto;
import com.bidzo.dto.notification.NotificationDetailsDto;
import com.bidzo.dto.notification.NotificationResponseDto;
import com.bidzo.dto.notification.NotificationSummaryDto;
import com.bidzo.dto.notification.NotificationUpdateDto;
import com.bidzo.entity.Notification;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class NotificationMapperImpl implements NotificationMapper {

    @Override
    public Notification toEntity(NotificationCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Notification notification = new Notification();

        return notification;
    }

    @Override
    public NotificationDetailsDto toDetailsDto(Notification entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationDetailsDto notificationDetailsDto = new NotificationDetailsDto();

        return notificationDetailsDto;
    }

    @Override
    public NotificationResponseDto toResponseDto(Notification entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationResponseDto notificationResponseDto = new NotificationResponseDto();

        return notificationResponseDto;
    }

    @Override
    public NotificationSummaryDto toSummaryDto(Notification entity) {
        if ( entity == null ) {
            return null;
        }

        NotificationSummaryDto notificationSummaryDto = new NotificationSummaryDto();

        return notificationSummaryDto;
    }

    @Override
    public void updateFromDto(NotificationUpdateDto dto, Notification entity) {
        if ( dto == null ) {
            return;
        }
    }
}
