package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Brand;
import com.bidzo.dto.brand.BrandCreateDto;
import com.bidzo.dto.brand.BrandDetailsDto;
import com.bidzo.dto.brand.BrandResponseDto;
import com.bidzo.dto.brand.BrandUpdateDto;
import com.bidzo.dto.brand.BrandSummaryDto;

@Mapper(componentModel = "spring")
public interface BrandMapper {
    Brand toEntity(BrandCreateDto dto);
    BrandDetailsDto toDetailsDto(Brand entity);
    BrandResponseDto toResponseDto(Brand entity);
    BrandSummaryDto toSummaryDto(Brand entity);
    void updateFromDto(BrandUpdateDto dto, @MappingTarget Brand entity);
}
