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
import com.bidzo.service.LocationService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.location.*;

@RestController
@RequestMapping("/api/locations")
public class LocationController {
    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<LocationResponseDto>> create(@RequestBody LocationCreateDto createDto) {
        LocationResponseDto result = locationService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<LocationResponseDto>builder().success(true).message("Location created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<LocationResponseDto>> update(@RequestBody LocationUpdateDto updateDto) {
        LocationResponseDto result = locationService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<LocationResponseDto>builder().success(true).message("Location updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LocationDetailsDto>> getById(@PathVariable Long id) {
        LocationDetailsDto result = locationService.getById(id);
        return ResponseEntity.ok(ApiResponse.<LocationDetailsDto>builder().success(true).message("Location details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<LocationSummaryDto>>> getAll() {
        List<LocationSummaryDto> result = locationService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<LocationSummaryDto>>builder().success(true).message("Location list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<LocationSummaryDto>>> search(@RequestBody LocationSearchDto searchDto) {
        List<LocationSummaryDto> result = locationService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<LocationSummaryDto>>builder().success(true).message("Location search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<LocationSummaryDto>>> filter(@RequestBody LocationFilterDto filterDto) {
        List<LocationSummaryDto> result = locationService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<LocationSummaryDto>>builder().success(true).message("Location filter completed").data(result).build());
    }

}