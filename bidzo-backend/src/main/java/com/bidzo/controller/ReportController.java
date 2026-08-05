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
import com.bidzo.service.ReportService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.report.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<ReportResponseDto>> generateReport(@RequestBody ReportCreateDto createDto) {
        ReportResponseDto result = reportService.generateReport(createDto);
        return ResponseEntity.ok(ApiResponse.<ReportResponseDto>builder().success(true).message("Report generated").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportDetailsDto>> getById(@PathVariable Long id) {
        ReportDetailsDto result = reportService.getById(id);
        return ResponseEntity.ok(ApiResponse.<ReportDetailsDto>builder().success(true).message("Report details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<ReportSummaryDto>>> search(@RequestBody ReportSearchDto searchDto) {
        List<ReportSummaryDto> result = reportService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<ReportSummaryDto>>builder().success(true).message("Report search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<ReportSummaryDto>>> filter(@RequestBody ReportFilterDto filterDto) {
        List<ReportSummaryDto> result = reportService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<ReportSummaryDto>>builder().success(true).message("Report filter completed").data(result).build());
    }

}