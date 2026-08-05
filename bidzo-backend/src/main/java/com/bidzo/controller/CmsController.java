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
import com.bidzo.service.CmsService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.cms.*;

@RestController
@RequestMapping("/api/cms")
public class CmsController {
    private final CmsService cmsService;

    public CmsController(CmsService cmsService) {
        this.cmsService = cmsService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CmsResponseDto>> create(@RequestBody CmsCreateDto createDto) {
        CmsResponseDto result = cmsService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<CmsResponseDto>builder().success(true).message("CMS created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CmsResponseDto>> update(@RequestBody CmsUpdateDto updateDto) {
        CmsResponseDto result = cmsService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<CmsResponseDto>builder().success(true).message("CMS updated").data(result).build());
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<ApiResponse<Void>> publish(@PathVariable Long id) {
        cmsService.publish(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CmsDetailsDto>> getById(@PathVariable Long id) {
        CmsDetailsDto result = cmsService.getById(id);
        return ResponseEntity.ok(ApiResponse.<CmsDetailsDto>builder().success(true).message("CMS details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<CmsSummaryDto>>> search(@RequestBody CmsSearchDto searchDto) {
        List<CmsSummaryDto> result = cmsService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<CmsSummaryDto>>builder().success(true).message("CMS search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<CmsSummaryDto>>> filter(@RequestBody CmsFilterDto filterDto) {
        List<CmsSummaryDto> result = cmsService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<CmsSummaryDto>>builder().success(true).message("CMS filter completed").data(result).build());
    }

}