package com.bidzo.service.impl;

import com.bidzo.dto.order.*;
import com.bidzo.repository.InvoiceRepository;
import com.bidzo.repository.OrderItemRepository;
import com.bidzo.repository.ShippingRepository;
import com.bidzo.service.OrderService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderItemRepository orderItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final ShippingRepository shippingRepository;

    public OrderServiceImpl(OrderItemRepository orderItemRepository, InvoiceRepository invoiceRepository, ShippingRepository shippingRepository) {
        this.orderItemRepository = orderItemRepository;
        this.invoiceRepository = invoiceRepository;
        this.shippingRepository = shippingRepository;
    }

    @Override
    public OrderResponseDto placeOrder(OrderCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public OrderResponseDto update(OrderUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void cancel(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public OrderDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<OrderSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<OrderSummaryDto> search(OrderSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<OrderSummaryDto> filter(OrderFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
