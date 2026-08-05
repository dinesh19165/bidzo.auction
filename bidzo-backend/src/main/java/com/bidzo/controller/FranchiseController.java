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
import com.bidzo.service.FranchiseService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.franchise.*;

@RestController
@RequestMapping("/api/franchises")
public class FranchiseController {
    private final FranchiseService franchiseService;

    public FranchiseController(FranchiseService franchiseService) {
        this.franchiseService = franchiseService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<FranchiseResponseDto>> create(@RequestBody FranchiseCreateDto createDto) {
        FranchiseResponseDto result = franchiseService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<FranchiseResponseDto>builder().success(true).message("Franchise created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<FranchiseResponseDto>> update(@RequestBody FranchiseUpdateDto updateDto) {
        FranchiseResponseDto result = franchiseService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<FranchiseResponseDto>builder().success(true).message("Franchise updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        franchiseService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FranchiseDetailsDto>> getById(@PathVariable Long id) {
        FranchiseDetailsDto result = franchiseService.getById(id);
        return ResponseEntity.ok(ApiResponse.<FranchiseDetailsDto>builder().success(true).message("Franchise details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<FranchiseSummaryDto>>> getAll() {
        List<FranchiseSummaryDto> result = franchiseService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<FranchiseSummaryDto>>builder().success(true).message("Franchise list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<FranchiseSummaryDto>>> search(@RequestBody FranchiseSearchDto searchDto) {
        List<FranchiseSummaryDto> result = franchiseService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<FranchiseSummaryDto>>builder().success(true).message("Franchise search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<FranchiseSummaryDto>>> filter(@RequestBody FranchiseFilterDto filterDto) {
        List<FranchiseSummaryDto> result = franchiseService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<FranchiseSummaryDto>>builder().success(true).message("Franchise filter completed").data(result).build());
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<FranchiseSummaryDto>>> getByOrganization(@PathVariable Long organizationId) {
        List<FranchiseSummaryDto> result = franchiseService.getByOrganization(organizationId);
        return ResponseEntity.ok(ApiResponse.<List<FranchiseSummaryDto>>builder().success(true).message("Franchises by organization retrieved").data(result).build());
    }

}