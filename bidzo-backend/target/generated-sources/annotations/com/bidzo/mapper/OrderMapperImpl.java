package com.bidzo.mapper;

import com.bidzo.dto.order.OrderCreateDto;
import com.bidzo.dto.order.OrderDetailsDto;
import com.bidzo.dto.order.OrderResponseDto;
import com.bidzo.dto.order.OrderSummaryDto;
import com.bidzo.dto.order.OrderUpdateDto;
import com.bidzo.entity.Order;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class OrderMapperImpl implements OrderMapper {

    @Override
    public Order toEntity(OrderCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Order order = new Order();

        return order;
    }

    @Override
    public OrderDetailsDto toDetailsDto(Order entity) {
        if ( entity == null ) {
            return null;
        }

        OrderDetailsDto orderDetailsDto = new OrderDetailsDto();

        return orderDetailsDto;
    }

    @Override
    public OrderResponseDto toResponseDto(Order entity) {
        if ( entity == null ) {
            return null;
        }

        OrderResponseDto orderResponseDto = new OrderResponseDto();

        return orderResponseDto;
    }

    @Override
    public OrderSummaryDto toSummaryDto(Order entity) {
        if ( entity == null ) {
            return null;
        }

        OrderSummaryDto orderSummaryDto = new OrderSummaryDto();

        return orderSummaryDto;
    }

    @Override
    public void updateFromDto(OrderUpdateDto dto, Order entity) {
        if ( dto == null ) {
            return;
        }
    }
}
