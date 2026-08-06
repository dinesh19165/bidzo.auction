package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Address;
import com.bidzo.dto.location.LocationCreateDto;
import com.bidzo.dto.location.LocationDetailsDto;
import com.bidzo.dto.location.LocationResponseDto;
import com.bidzo.dto.location.LocationUpdateDto;
import com.bidzo.dto.location.LocationSummaryDto;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    Address toEntity(LocationCreateDto dto);
    LocationDetailsDto toDetailsDto(Address entity);
    LocationResponseDto toResponseDto(Address entity);
    LocationSummaryDto toSummaryDto(Address entity);
    void updateFromDto(LocationUpdateDto dto, @MappingTarget Address entity);
}
