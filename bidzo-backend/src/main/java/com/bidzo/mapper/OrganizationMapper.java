package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Organization;
import com.bidzo.dto.organization.OrganizationCreateDto;
import com.bidzo.dto.organization.OrganizationDetailsDto;
import com.bidzo.dto.organization.OrganizationResponseDto;
import com.bidzo.dto.organization.OrganizationUpdateDto;
import com.bidzo.dto.organization.OrganizationSummaryDto;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {
    Organization toEntity(OrganizationCreateDto dto);
    OrganizationDetailsDto toDetailsDto(Organization entity);
    OrganizationResponseDto toResponseDto(Organization entity);
    OrganizationSummaryDto toSummaryDto(Organization entity);
    void updateFromDto(OrganizationUpdateDto dto, @MappingTarget Organization entity);
}
