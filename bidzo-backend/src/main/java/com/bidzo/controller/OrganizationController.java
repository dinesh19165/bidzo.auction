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
import com.bidzo.service.OrganizationService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.organization.*;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<OrganizationResponseDto>> create(@RequestBody OrganizationCreateDto createDto) {
        OrganizationResponseDto result = organizationService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<OrganizationResponseDto>builder().success(true).message("Organization created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<OrganizationResponseDto>> update(@RequestBody OrganizationUpdateDto updateDto) {
        OrganizationResponseDto result = organizationService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<OrganizationResponseDto>builder().success(true).message("Organization updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        organizationService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrganizationDetailsDto>> getById(@PathVariable Long id) {
        OrganizationDetailsDto result = organizationService.getById(id);
        return ResponseEntity.ok(ApiResponse.<OrganizationDetailsDto>builder().success(true).message("Organization details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<OrganizationSummaryDto>>> getAll() {
        List<OrganizationSummaryDto> result = organizationService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<OrganizationSummaryDto>>builder().success(true).message("Organization list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<OrganizationSummaryDto>>> search(@RequestBody OrganizationSearchDto searchDto) {
        List<OrganizationSummaryDto> result = organizationService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<OrganizationSummaryDto>>builder().success(true).message("Organization search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<OrganizationSummaryDto>>> filter(@RequestBody OrganizationFilterDto filterDto) {
        List<OrganizationSummaryDto> result = organizationService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<OrganizationSummaryDto>>builder().success(true).message("Organization filter completed").data(result).build());
    }

}