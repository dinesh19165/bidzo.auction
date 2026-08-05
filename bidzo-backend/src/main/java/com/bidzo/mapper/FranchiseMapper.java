package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Franchise;
import com.bidzo.dto.franchise.FranchiseCreateDto;
import com.bidzo.dto.franchise.FranchiseDetailsDto;
import com.bidzo.dto.franchise.FranchiseResponseDto;
import com.bidzo.dto.franchise.FranchiseUpdateDto;
import com.bidzo.dto.franchise.FranchiseSummaryDto;

@Mapper(componentModel = "spring")
public interface FranchiseMapper {
    Franchise toEntity(FranchiseCreateDto dto);
    FranchiseDetailsDto toDetailsDto(Franchise entity);
    FranchiseResponseDto toResponseDto(Franchise entity);
    FranchiseSummaryDto toSummaryDto(Franchise entity);
    void updateFromDto(FranchiseUpdateDto dto, @MappingTarget Franchise entity);
}
