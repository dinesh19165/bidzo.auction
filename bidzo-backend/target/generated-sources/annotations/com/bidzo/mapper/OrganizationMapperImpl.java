package com.bidzo.mapper;

import com.bidzo.dto.organization.OrganizationCreateDto;
import com.bidzo.dto.organization.OrganizationDetailsDto;
import com.bidzo.dto.organization.OrganizationResponseDto;
import com.bidzo.dto.organization.OrganizationSummaryDto;
import com.bidzo.dto.organization.OrganizationUpdateDto;
import com.bidzo.entity.Organization;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public Organization toEntity(OrganizationCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Organization organization = new Organization();

        return organization;
    }

    @Override
    public OrganizationDetailsDto toDetailsDto(Organization entity) {
        if ( entity == null ) {
            return null;
        }

        OrganizationDetailsDto organizationDetailsDto = new OrganizationDetailsDto();

        return organizationDetailsDto;
    }

    @Override
    public OrganizationResponseDto toResponseDto(Organization entity) {
        if ( entity == null ) {
            return null;
        }

        OrganizationResponseDto organizationResponseDto = new OrganizationResponseDto();

        return organizationResponseDto;
    }

    @Override
    public OrganizationSummaryDto toSummaryDto(Organization entity) {
        if ( entity == null ) {
            return null;
        }

        OrganizationSummaryDto organizationSummaryDto = new OrganizationSummaryDto();

        return organizationSummaryDto;
    }

    @Override
    public void updateFromDto(OrganizationUpdateDto dto, Organization entity) {
        if ( dto == null ) {
            return;
        }
    }
}
