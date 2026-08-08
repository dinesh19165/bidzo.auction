package com.bidzo.mapper;

import com.bidzo.dto.brand.BrandCreateDto;
import com.bidzo.dto.brand.BrandDetailsDto;
import com.bidzo.dto.brand.BrandResponseDto;
import com.bidzo.dto.brand.BrandSummaryDto;
import com.bidzo.dto.brand.BrandUpdateDto;
import com.bidzo.entity.Brand;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class BrandMapperImpl implements BrandMapper {

    @Override
    public Brand toEntity(BrandCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Brand brand = new Brand();

        return brand;
    }

    @Override
    public BrandDetailsDto toDetailsDto(Brand entity) {
        if ( entity == null ) {
            return null;
        }

        BrandDetailsDto brandDetailsDto = new BrandDetailsDto();

        return brandDetailsDto;
    }

    @Override
    public BrandResponseDto toResponseDto(Brand entity) {
        if ( entity == null ) {
            return null;
        }

        BrandResponseDto brandResponseDto = new BrandResponseDto();

        return brandResponseDto;
    }

    @Override
    public BrandSummaryDto toSummaryDto(Brand entity) {
        if ( entity == null ) {
            return null;
        }

        BrandSummaryDto brandSummaryDto = new BrandSummaryDto();

        return brandSummaryDto;
    }

    @Override
    public void updateFromDto(BrandUpdateDto dto, Brand entity) {
        if ( dto == null ) {
            return;
        }
    }
}
