package com.bidzo.mapper;

import com.bidzo.dto.vendor.VendorCreateDto;
import com.bidzo.dto.vendor.VendorDetailsDto;
import com.bidzo.dto.vendor.VendorResponseDto;
import com.bidzo.dto.vendor.VendorSummaryDto;
import com.bidzo.dto.vendor.VendorUpdateDto;
import com.bidzo.entity.VendorProfile;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class VendorMapperImpl implements VendorMapper {

    @Override
    public VendorProfile toEntity(VendorCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        VendorProfile vendorProfile = new VendorProfile();

        return vendorProfile;
    }

    @Override
    public VendorDetailsDto toDetailsDto(VendorProfile entity) {
        if ( entity == null ) {
            return null;
        }

        VendorDetailsDto vendorDetailsDto = new VendorDetailsDto();

        return vendorDetailsDto;
    }

    @Override
    public VendorResponseDto toResponseDto(VendorProfile entity) {
        if ( entity == null ) {
            return null;
        }

        VendorResponseDto vendorResponseDto = new VendorResponseDto();

        return vendorResponseDto;
    }

    @Override
    public VendorSummaryDto toSummaryDto(VendorProfile entity) {
        if ( entity == null ) {
            return null;
        }

        VendorSummaryDto vendorSummaryDto = new VendorSummaryDto();

        return vendorSummaryDto;
    }

    @Override
    public void updateFromDto(VendorUpdateDto dto, VendorProfile entity) {
        if ( dto == null ) {
            return;
        }
    }
}
