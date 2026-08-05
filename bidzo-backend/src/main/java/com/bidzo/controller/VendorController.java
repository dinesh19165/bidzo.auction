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
import com.bidzo.service.VendorService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.vendor.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {
    private final VendorService vendorService;

    public VendorController(VendorService vendorService) {
        this.vendorService = vendorService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<VendorResponseDto>> create(@RequestBody VendorCreateDto createDto) {
        VendorResponseDto result = vendorService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<VendorResponseDto>builder().success(true).message("Vendor created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<VendorResponseDto>> update(@RequestBody VendorUpdateDto updateDto) {
        VendorResponseDto result = vendorService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<VendorResponseDto>builder().success(true).message("Vendor updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        vendorService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VendorDetailsDto>> getById(@PathVariable Long id) {
        VendorDetailsDto result = vendorService.getById(id);
        return ResponseEntity.ok(ApiResponse.<VendorDetailsDto>builder().success(true).message("Vendor details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<VendorSummaryDto>>> getAll() {
        List<VendorSummaryDto> result = vendorService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<VendorSummaryDto>>builder().success(true).message("Vendor list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<VendorSummaryDto>>> search(@RequestBody VendorSearchDto searchDto) {
        List<VendorSummaryDto> result = vendorService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<VendorSummaryDto>>builder().success(true).message("Vendor search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<VendorSummaryDto>>> filter(@RequestBody VendorFilterDto filterDto) {
        List<VendorSummaryDto> result = vendorService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<VendorSummaryDto>>builder().success(true).message("Vendor filter completed").data(result).build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<VendorDetailsDto>> getByUserId(@PathVariable Long userId) {
        VendorDetailsDto result = vendorService.getByUserId(userId);
        return ResponseEntity.ok(ApiResponse.<VendorDetailsDto>builder().success(true).message("Vendor details by user retrieved").data(result).build());
    }

}