package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Order;
import com.bidzo.dto.order.OrderCreateDto;
import com.bidzo.dto.order.OrderDetailsDto;
import com.bidzo.dto.order.OrderResponseDto;
import com.bidzo.dto.order.OrderUpdateDto;
import com.bidzo.dto.order.OrderSummaryDto;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    Order toEntity(OrderCreateDto dto);
    OrderDetailsDto toDetailsDto(Order entity);
    OrderResponseDto toResponseDto(Order entity);
    OrderSummaryDto toSummaryDto(Order entity);
    void updateFromDto(OrderUpdateDto dto, @MappingTarget Order entity);
}
