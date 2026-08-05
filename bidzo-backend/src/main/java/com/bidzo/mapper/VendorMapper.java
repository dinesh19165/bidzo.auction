package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.VendorProfile;
import com.bidzo.dto.vendor.VendorCreateDto;
import com.bidzo.dto.vendor.VendorDetailsDto;
import com.bidzo.dto.vendor.VendorResponseDto;
import com.bidzo.dto.vendor.VendorUpdateDto;
import com.bidzo.dto.vendor.VendorSummaryDto;

@Mapper(componentModel = "spring")
public interface VendorMapper {
    VendorProfile toEntity(VendorCreateDto dto);
    VendorDetailsDto toDetailsDto(VendorProfile entity);
    VendorResponseDto toResponseDto(VendorProfile entity);
    VendorSummaryDto toSummaryDto(VendorProfile entity);
    void updateFromDto(VendorUpdateDto dto, @MappingTarget VendorProfile entity);
}
