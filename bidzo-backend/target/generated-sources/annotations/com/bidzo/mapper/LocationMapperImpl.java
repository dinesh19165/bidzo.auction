package com.bidzo.mapper;

import com.bidzo.dto.location.LocationCreateDto;
import com.bidzo.dto.location.LocationDetailsDto;
import com.bidzo.dto.location.LocationResponseDto;
import com.bidzo.dto.location.LocationSummaryDto;
import com.bidzo.dto.location.LocationUpdateDto;
import com.bidzo.entity.Address;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class LocationMapperImpl implements LocationMapper {

    @Override
    public Address toEntity(LocationCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Address address = new Address();

        return address;
    }

    @Override
    public LocationDetailsDto toDetailsDto(Address entity) {
        if ( entity == null ) {
            return null;
        }

        LocationDetailsDto locationDetailsDto = new LocationDetailsDto();

        return locationDetailsDto;
    }

    @Override
    public LocationResponseDto toResponseDto(Address entity) {
        if ( entity == null ) {
            return null;
        }

        LocationResponseDto locationResponseDto = new LocationResponseDto();

        return locationResponseDto;
    }

    @Override
    public LocationSummaryDto toSummaryDto(Address entity) {
        if ( entity == null ) {
            return null;
        }

        LocationSummaryDto locationSummaryDto = new LocationSummaryDto();

        return locationSummaryDto;
    }

    @Override
    public void updateFromDto(LocationUpdateDto dto, Address entity) {
        if ( dto == null ) {
            return;
        }
    }
}
