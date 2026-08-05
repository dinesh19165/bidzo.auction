package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.CustomerProfile;
import com.bidzo.dto.customer.CustomerCreateDto;
import com.bidzo.dto.customer.CustomerDetailsDto;
import com.bidzo.dto.customer.CustomerResponseDto;
import com.bidzo.dto.customer.CustomerUpdateDto;
import com.bidzo.dto.customer.CustomerSummaryDto;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    CustomerProfile toEntity(CustomerCreateDto dto);
    CustomerDetailsDto toDetailsDto(CustomerProfile entity);
    CustomerResponseDto toResponseDto(CustomerProfile entity);
    CustomerSummaryDto toSummaryDto(CustomerProfile entity);
    void updateFromDto(CustomerUpdateDto dto, @MappingTarget CustomerProfile entity);
}
