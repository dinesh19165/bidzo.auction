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
import com.bidzo.service.BrandService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.brand.*;

@RestController
@RequestMapping("/api/brands")
public class BrandController {
    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<BrandResponseDto>> create(@RequestBody BrandCreateDto createDto) {
        BrandResponseDto result = brandService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<BrandResponseDto>builder().success(true).message("Brand created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<BrandResponseDto>> update(@RequestBody BrandUpdateDto updateDto) {
        BrandResponseDto result = brandService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<BrandResponseDto>builder().success(true).message("Brand updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandDetailsDto>> getById(@PathVariable Long id) {
        BrandDetailsDto result = brandService.getById(id);
        return ResponseEntity.ok(ApiResponse.<BrandDetailsDto>builder().success(true).message("Brand details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<BrandSummaryDto>>> getAll() {
        List<BrandSummaryDto> result = brandService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<BrandSummaryDto>>builder().success(true).message("Brand list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<BrandSummaryDto>>> search(@RequestBody BrandSearchDto searchDto) {
        List<BrandSummaryDto> result = brandService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<BrandSummaryDto>>builder().success(true).message("Brand search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<BrandSummaryDto>>> filter(@RequestBody BrandFilterDto filterDto) {
        List<BrandSummaryDto> result = brandService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<BrandSummaryDto>>builder().success(true).message("Brand filter completed").data(result).build());
    }

}