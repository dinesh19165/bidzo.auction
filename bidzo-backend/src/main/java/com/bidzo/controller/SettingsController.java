package com.bidzo.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bidzo.service.SettingsService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.settings.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {
    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<SettingsResponseDto>> update(@RequestBody SettingsUpdateDto updateDto) {
        SettingsResponseDto result = settingsService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<SettingsResponseDto>builder().success(true).message("Settings updated").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SettingsDetailsDto>> getById(@PathVariable Long id) {
        SettingsDetailsDto result = settingsService.getById(id);
        return ResponseEntity.ok(ApiResponse.<SettingsDetailsDto>builder().success(true).message("Settings details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<SettingsSummaryDto>>> search(@RequestBody SettingsSearchDto searchDto) {
        List<SettingsSummaryDto> result = settingsService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<SettingsSummaryDto>>builder().success(true).message("Settings search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<SettingsSummaryDto>>> filter(@RequestBody SettingsFilterDto filterDto) {
        List<SettingsSummaryDto> result = settingsService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<SettingsSummaryDto>>builder().success(true).message("Settings filter completed").data(result).build());
    }

}