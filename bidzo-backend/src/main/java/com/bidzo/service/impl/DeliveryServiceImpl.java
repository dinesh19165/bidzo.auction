package com.bidzo.service.impl;

import com.bidzo.dto.delivery.*;
import com.bidzo.repository.DeliveryPartnerRepository;
import com.bidzo.repository.DeliveryTrackingRepository;
import com.bidzo.service.DeliveryService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryTrackingRepository deliveryTrackingRepository;
    private final DeliveryPartnerRepository deliveryPartnerRepository;

    public DeliveryServiceImpl(DeliveryTrackingRepository deliveryTrackingRepository, DeliveryPartnerRepository deliveryPartnerRepository) {
        this.deliveryTrackingRepository = deliveryTrackingRepository;
        this.deliveryPartnerRepository = deliveryPartnerRepository;
    }

    @Override
    public DeliveryResponseDto create(DeliveryCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public DeliveryResponseDto update(DeliveryUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void cancel(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public DeliveryDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<DeliverySummaryDto> getByOrder(Long orderId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<DeliverySummaryDto> search(DeliverySearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<DeliverySummaryDto> filter(DeliveryFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
