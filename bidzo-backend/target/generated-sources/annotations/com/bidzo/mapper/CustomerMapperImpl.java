package com.bidzo.mapper;

import com.bidzo.dto.customer.CustomerCreateDto;
import com.bidzo.dto.customer.CustomerDetailsDto;
import com.bidzo.dto.customer.CustomerResponseDto;
import com.bidzo.dto.customer.CustomerSummaryDto;
import com.bidzo.dto.customer.CustomerUpdateDto;
import com.bidzo.entity.CustomerProfile;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public CustomerProfile toEntity(CustomerCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        CustomerProfile customerProfile = new CustomerProfile();

        return customerProfile;
    }

    @Override
    public CustomerDetailsDto toDetailsDto(CustomerProfile entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerDetailsDto customerDetailsDto = new CustomerDetailsDto();

        return customerDetailsDto;
    }

    @Override
    public CustomerResponseDto toResponseDto(CustomerProfile entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerResponseDto customerResponseDto = new CustomerResponseDto();

        return customerResponseDto;
    }

    @Override
    public CustomerSummaryDto toSummaryDto(CustomerProfile entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerSummaryDto customerSummaryDto = new CustomerSummaryDto();

        return customerSummaryDto;
    }

    @Override
    public void updateFromDto(CustomerUpdateDto dto, CustomerProfile entity) {
        if ( dto == null ) {
            return;
        }
    }
}
