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
import com.bidzo.service.SupportService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.support.*;

@RestController
@RequestMapping("/api/support")
public class SupportController {
    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<SupportResponseDto>> create(@RequestBody SupportCreateDto createDto) {
        SupportResponseDto result = supportService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<SupportResponseDto>builder().success(true).message("Support ticket created").data(result).build());
    }

    @PostMapping("/reply")
    public ResponseEntity<ApiResponse<SupportResponseDto>> reply(@RequestBody SupportUpdateDto updateDto) {
        SupportResponseDto result = supportService.reply(updateDto);
        return ResponseEntity.ok(ApiResponse.<SupportResponseDto>builder().success(true).message("Support reply added").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupportDetailsDto>> getById(@PathVariable Long id) {
        SupportDetailsDto result = supportService.getById(id);
        return ResponseEntity.ok(ApiResponse.<SupportDetailsDto>builder().success(true).message("Support details retrieved").data(result).build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<SupportSummaryDto>>> getTicketsByUser(@PathVariable Long userId) {
        List<SupportSummaryDto> result = supportService.getTicketsByUser(userId);
        return ResponseEntity.ok(ApiResponse.<List<SupportSummaryDto>>builder().success(true).message("Support tickets retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<SupportSummaryDto>>> search(@RequestBody SupportSearchDto searchDto) {
        List<SupportSummaryDto> result = supportService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<SupportSummaryDto>>builder().success(true).message("Support search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<SupportSummaryDto>>> filter(@RequestBody SupportFilterDto filterDto) {
        List<SupportSummaryDto> result = supportService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<SupportSummaryDto>>builder().success(true).message("Support filter completed").data(result).build());
    }

}