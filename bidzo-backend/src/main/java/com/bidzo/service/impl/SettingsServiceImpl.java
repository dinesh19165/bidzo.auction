package com.bidzo.service.impl;

import com.bidzo.dto.settings.*;
import com.bidzo.repository.SystemConfigurationRepository;
import com.bidzo.service.SettingsService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SettingsServiceImpl implements SettingsService {

    private final SystemConfigurationRepository systemConfigurationRepository;

    public SettingsServiceImpl(SystemConfigurationRepository systemConfigurationRepository) {
        this.systemConfigurationRepository = systemConfigurationRepository;
    }

    @Override
    public SettingsResponseDto update(SettingsUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public SettingsDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<SettingsSummaryDto> search(SettingsSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<SettingsSummaryDto> filter(SettingsFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
