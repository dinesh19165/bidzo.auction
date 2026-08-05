package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.SystemConfiguration;
import com.bidzo.dto.settings.SettingsCreateDto;
import com.bidzo.dto.settings.SettingsDetailsDto;
import com.bidzo.dto.settings.SettingsResponseDto;
import com.bidzo.dto.settings.SettingsUpdateDto;
import com.bidzo.dto.settings.SettingsSummaryDto;

@Mapper(componentModel = "spring")
public interface SettingsMapper {
    SystemConfiguration toEntity(SettingsCreateDto dto);
    SettingsDetailsDto toDetailsDto(SystemConfiguration entity);
    SettingsResponseDto toResponseDto(SystemConfiguration entity);
    SettingsSummaryDto toSummaryDto(SystemConfiguration entity);
    void updateFromDto(SettingsUpdateDto dto, @MappingTarget SystemConfiguration entity);
}
