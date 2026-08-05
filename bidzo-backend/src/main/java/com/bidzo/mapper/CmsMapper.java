package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.CMSComponent;
import com.bidzo.dto.cms.CmsCreateDto;
import com.bidzo.dto.cms.CmsDetailsDto;
import com.bidzo.dto.cms.CmsResponseDto;
import com.bidzo.dto.cms.CmsUpdateDto;
import com.bidzo.dto.cms.CmsSummaryDto;

@Mapper(componentModel = "spring")
public interface CmsMapper {
    CMSComponent toEntity(CmsCreateDto dto);
    CmsDetailsDto toDetailsDto(CMSComponent entity);
    CmsResponseDto toResponseDto(CMSComponent entity);
    CmsSummaryDto toSummaryDto(CMSComponent entity);
    void updateFromDto(CmsUpdateDto dto, @MappingTarget CMSComponent entity);
}
