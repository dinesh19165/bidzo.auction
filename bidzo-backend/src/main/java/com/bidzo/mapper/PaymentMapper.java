package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Payment;
import com.bidzo.dto.payment.PaymentCreateDto;
import com.bidzo.dto.payment.PaymentDetailsDto;
import com.bidzo.dto.payment.PaymentResponseDto;
import com.bidzo.dto.payment.PaymentUpdateDto;
import com.bidzo.dto.payment.PaymentSummaryDto;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    Payment toEntity(PaymentCreateDto dto);
    PaymentDetailsDto toDetailsDto(Payment entity);
    PaymentResponseDto toResponseDto(Payment entity);
    PaymentSummaryDto toSummaryDto(Payment entity);
    void updateFromDto(PaymentUpdateDto dto, @MappingTarget Payment entity);
}
