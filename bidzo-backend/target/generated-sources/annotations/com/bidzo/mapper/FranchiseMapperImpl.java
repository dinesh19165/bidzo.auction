package com.bidzo.mapper;

import com.bidzo.dto.franchise.FranchiseCreateDto;
import com.bidzo.dto.franchise.FranchiseDetailsDto;
import com.bidzo.dto.franchise.FranchiseResponseDto;
import com.bidzo.dto.franchise.FranchiseSummaryDto;
import com.bidzo.dto.franchise.FranchiseUpdateDto;
import com.bidzo.entity.Franchise;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class FranchiseMapperImpl implements FranchiseMapper {

    @Override
    public Franchise toEntity(FranchiseCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Franchise franchise = new Franchise();

        return franchise;
    }

    @Override
    public FranchiseDetailsDto toDetailsDto(Franchise entity) {
        if ( entity == null ) {
            return null;
        }

        FranchiseDetailsDto franchiseDetailsDto = new FranchiseDetailsDto();

        return franchiseDetailsDto;
    }

    @Override
    public FranchiseResponseDto toResponseDto(Franchise entity) {
        if ( entity == null ) {
            return null;
        }

        FranchiseResponseDto franchiseResponseDto = new FranchiseResponseDto();

        return franchiseResponseDto;
    }

    @Override
    public FranchiseSummaryDto toSummaryDto(Franchise entity) {
        if ( entity == null ) {
            return null;
        }

        FranchiseSummaryDto franchiseSummaryDto = new FranchiseSummaryDto();

        return franchiseSummaryDto;
    }

    @Override
    public void updateFromDto(FranchiseUpdateDto dto, Franchise entity) {
        if ( dto == null ) {
            return;
        }
    }
}
