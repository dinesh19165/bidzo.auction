package com.bidzo.mapper;

import com.bidzo.dto.payment.PaymentCreateDto;
import com.bidzo.dto.payment.PaymentDetailsDto;
import com.bidzo.dto.payment.PaymentResponseDto;
import com.bidzo.dto.payment.PaymentSummaryDto;
import com.bidzo.dto.payment.PaymentUpdateDto;
import com.bidzo.entity.Payment;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class PaymentMapperImpl implements PaymentMapper {

    @Override
    public Payment toEntity(PaymentCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Payment payment = new Payment();

        return payment;
    }

    @Override
    public PaymentDetailsDto toDetailsDto(Payment entity) {
        if ( entity == null ) {
            return null;
        }

        PaymentDetailsDto paymentDetailsDto = new PaymentDetailsDto();

        return paymentDetailsDto;
    }

    @Override
    public PaymentResponseDto toResponseDto(Payment entity) {
        if ( entity == null ) {
            return null;
        }

        PaymentResponseDto paymentResponseDto = new PaymentResponseDto();

        return paymentResponseDto;
    }

    @Override
    public PaymentSummaryDto toSummaryDto(Payment entity) {
        if ( entity == null ) {
            return null;
        }

        PaymentSummaryDto paymentSummaryDto = new PaymentSummaryDto();

        return paymentSummaryDto;
    }

    @Override
    public void updateFromDto(PaymentUpdateDto dto, Payment entity) {
        if ( dto == null ) {
            return;
        }
    }
}
