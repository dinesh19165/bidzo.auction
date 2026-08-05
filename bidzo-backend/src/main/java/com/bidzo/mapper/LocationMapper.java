package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Location;
import com.bidzo.dto.location.LocationCreateDto;
import com.bidzo.dto.location.LocationDetailsDto;
import com.bidzo.dto.location.LocationResponseDto;
import com.bidzo.dto.location.LocationUpdateDto;
import com.bidzo.dto.location.LocationSummaryDto;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    Location toEntity(LocationCreateDto dto);
    LocationDetailsDto toDetailsDto(Location entity);
    LocationResponseDto toResponseDto(Location entity);
    LocationSummaryDto toSummaryDto(Location entity);
    void updateFromDto(LocationUpdateDto dto, @MappingTarget Location entity);
}
