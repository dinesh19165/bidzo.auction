package com.bidzo.mapper;

import com.bidzo.dto.cms.CmsCreateDto;
import com.bidzo.dto.cms.CmsDetailsDto;
import com.bidzo.dto.cms.CmsResponseDto;
import com.bidzo.dto.cms.CmsSummaryDto;
import com.bidzo.dto.cms.CmsUpdateDto;
import com.bidzo.entity.CMSComponent;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class CmsMapperImpl implements CmsMapper {

    @Override
    public CMSComponent toEntity(CmsCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        CMSComponent cMSComponent = new CMSComponent();

        return cMSComponent;
    }

    @Override
    public CmsDetailsDto toDetailsDto(CMSComponent entity) {
        if ( entity == null ) {
            return null;
        }

        CmsDetailsDto cmsDetailsDto = new CmsDetailsDto();

        return cmsDetailsDto;
    }

    @Override
    public CmsResponseDto toResponseDto(CMSComponent entity) {
        if ( entity == null ) {
            return null;
        }

        CmsResponseDto cmsResponseDto = new CmsResponseDto();

        return cmsResponseDto;
    }

    @Override
    public CmsSummaryDto toSummaryDto(CMSComponent entity) {
        if ( entity == null ) {
            return null;
        }

        CmsSummaryDto cmsSummaryDto = new CmsSummaryDto();

        return cmsSummaryDto;
    }

    @Override
    public void updateFromDto(CmsUpdateDto dto, CMSComponent entity) {
        if ( dto == null ) {
            return;
        }
    }
}
