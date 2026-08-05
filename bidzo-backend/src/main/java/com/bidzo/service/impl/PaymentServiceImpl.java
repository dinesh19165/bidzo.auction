package com.bidzo.service.impl;

import com.bidzo.dto.payment.*;
import com.bidzo.repository.PaymentRepository;
import com.bidzo.repository.PaymentTransactionRepository;
import com.bidzo.service.PaymentService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository, PaymentTransactionRepository paymentTransactionRepository) {
        this.paymentRepository = paymentRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    @Override
    public PaymentResponseDto processPayment(PaymentCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public PaymentResponseDto update(PaymentUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public PaymentDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<PaymentSummaryDto> search(PaymentSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<PaymentSummaryDto> filter(PaymentFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
