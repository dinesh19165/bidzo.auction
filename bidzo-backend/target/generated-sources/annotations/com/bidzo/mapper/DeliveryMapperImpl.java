package com.bidzo.mapper;

import com.bidzo.dto.delivery.DeliveryCreateDto;
import com.bidzo.dto.delivery.DeliveryDetailsDto;
import com.bidzo.dto.delivery.DeliveryResponseDto;
import com.bidzo.dto.delivery.DeliverySummaryDto;
import com.bidzo.dto.delivery.DeliveryUpdateDto;
import com.bidzo.entity.DeliveryTracking;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class DeliveryMapperImpl implements DeliveryMapper {

    @Override
    public DeliveryTracking toEntity(DeliveryCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        DeliveryTracking deliveryTracking = new DeliveryTracking();

        return deliveryTracking;
    }

    @Override
    public DeliveryDetailsDto toDetailsDto(DeliveryTracking entity) {
        if ( entity == null ) {
            return null;
        }

        DeliveryDetailsDto deliveryDetailsDto = new DeliveryDetailsDto();

        return deliveryDetailsDto;
    }

    @Override
    public DeliveryResponseDto toResponseDto(DeliveryTracking entity) {
        if ( entity == null ) {
            return null;
        }

        DeliveryResponseDto deliveryResponseDto = new DeliveryResponseDto();

        return deliveryResponseDto;
    }

    @Override
    public DeliverySummaryDto toSummaryDto(DeliveryTracking entity) {
        if ( entity == null ) {
            return null;
        }

        DeliverySummaryDto deliverySummaryDto = new DeliverySummaryDto();

        return deliverySummaryDto;
    }

    @Override
    public void updateFromDto(DeliveryUpdateDto dto, DeliveryTracking entity) {
        if ( dto == null ) {
            return;
        }
    }
}
