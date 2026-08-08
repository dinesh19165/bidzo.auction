package com.bidzo.mapper;

import com.bidzo.dto.settings.SettingsCreateDto;
import com.bidzo.dto.settings.SettingsDetailsDto;
import com.bidzo.dto.settings.SettingsResponseDto;
import com.bidzo.dto.settings.SettingsSummaryDto;
import com.bidzo.dto.settings.SettingsUpdateDto;
import com.bidzo.entity.SystemConfiguration;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class SettingsMapperImpl implements SettingsMapper {

    @Override
    public SystemConfiguration toEntity(SettingsCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        SystemConfiguration systemConfiguration = new SystemConfiguration();

        return systemConfiguration;
    }

    @Override
    public SettingsDetailsDto toDetailsDto(SystemConfiguration entity) {
        if ( entity == null ) {
            return null;
        }

        SettingsDetailsDto settingsDetailsDto = new SettingsDetailsDto();

        return settingsDetailsDto;
    }

    @Override
    public SettingsResponseDto toResponseDto(SystemConfiguration entity) {
        if ( entity == null ) {
            return null;
        }

        SettingsResponseDto settingsResponseDto = new SettingsResponseDto();

        return settingsResponseDto;
    }

    @Override
    public SettingsSummaryDto toSummaryDto(SystemConfiguration entity) {
        if ( entity == null ) {
            return null;
        }

        SettingsSummaryDto settingsSummaryDto = new SettingsSummaryDto();

        return settingsSummaryDto;
    }

    @Override
    public void updateFromDto(SettingsUpdateDto dto, SystemConfiguration entity) {
        if ( dto == null ) {
            return;
        }
    }
}
