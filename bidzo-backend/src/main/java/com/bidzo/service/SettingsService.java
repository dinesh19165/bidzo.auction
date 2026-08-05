package com.bidzo.service;

import com.bidzo.dto.settings.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface SettingsService {

    SettingsResponseDto update(SettingsUpdateDto updateDto);
    SettingsDetailsDto getById(Long id);
    List<SettingsSummaryDto> search(SettingsSearchDto searchDto);
    List<SettingsSummaryDto> filter(SettingsFilterDto filterDto);
}
