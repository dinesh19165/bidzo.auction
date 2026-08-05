package com.bidzo.service;

import com.bidzo.dto.payment.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface PaymentService {

    PaymentResponseDto processPayment(PaymentCreateDto createDto);
    PaymentResponseDto update(PaymentUpdateDto updateDto);
    PaymentDetailsDto getById(Long id);
    List<PaymentSummaryDto> search(PaymentSearchDto searchDto);
    List<PaymentSummaryDto> filter(PaymentFilterDto filterDto);
}
