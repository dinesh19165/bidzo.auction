package com.bidzo.service;

import com.bidzo.dto.order.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface OrderService {

    OrderResponseDto placeOrder(OrderCreateDto createDto);
    OrderResponseDto update(OrderUpdateDto updateDto);
    void cancel(Long id);
    OrderDetailsDto getById(Long id);
    List<OrderSummaryDto> getAll();
    List<OrderSummaryDto> search(OrderSearchDto searchDto);
    List<OrderSummaryDto> filter(OrderFilterDto filterDto);
}
