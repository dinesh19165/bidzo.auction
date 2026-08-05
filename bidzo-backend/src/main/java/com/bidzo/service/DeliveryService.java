package com.bidzo.service;

import com.bidzo.dto.delivery.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface DeliveryService {

    DeliveryResponseDto create(DeliveryCreateDto createDto);
    DeliveryResponseDto update(DeliveryUpdateDto updateDto);
    void cancel(Long id);
    DeliveryDetailsDto getById(Long id);
    List<DeliverySummaryDto> getByOrder(Long orderId);
    List<DeliverySummaryDto> search(DeliverySearchDto searchDto);
    List<DeliverySummaryDto> filter(DeliveryFilterDto filterDto);
}
