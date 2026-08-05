package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.DeliveryTracking;
import com.bidzo.dto.delivery.DeliveryCreateDto;
import com.bidzo.dto.delivery.DeliveryDetailsDto;
import com.bidzo.dto.delivery.DeliveryResponseDto;
import com.bidzo.dto.delivery.DeliveryUpdateDto;
import com.bidzo.dto.delivery.DeliverySummaryDto;

@Mapper(componentModel = "spring")
public interface DeliveryMapper {
    DeliveryTracking toEntity(DeliveryCreateDto dto);
    DeliveryDetailsDto toDetailsDto(DeliveryTracking entity);
    DeliveryResponseDto toResponseDto(DeliveryTracking entity);
    DeliverySummaryDto toSummaryDto(DeliveryTracking entity);
    void updateFromDto(DeliveryUpdateDto dto, @MappingTarget DeliveryTracking entity);
}
