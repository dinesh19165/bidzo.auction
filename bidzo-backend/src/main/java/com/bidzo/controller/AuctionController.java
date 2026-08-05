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
import com.bidzo.service.AuctionService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.auction.*;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {
    private final AuctionService auctionService;

    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<AuctionResponseDto>> create(@RequestBody AuctionCreateDto createDto) {
        AuctionResponseDto result = auctionService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<AuctionResponseDto>builder().success(true).message("Auction created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<AuctionResponseDto>> update(@RequestBody AuctionUpdateDto updateDto) {
        AuctionResponseDto result = auctionService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<AuctionResponseDto>builder().success(true).message("Auction updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        auctionService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuctionDetailsDto>> getById(@PathVariable Long id) {
        AuctionDetailsDto result = auctionService.getById(id);
        return ResponseEntity.ok(ApiResponse.<AuctionDetailsDto>builder().success(true).message("Auction details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<AuctionSummaryDto>>> getAll() {
        List<AuctionSummaryDto> result = auctionService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<AuctionSummaryDto>>builder().success(true).message("Auction list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<AuctionSummaryDto>>> search(@RequestBody AuctionSearchDto searchDto) {
        List<AuctionSummaryDto> result = auctionService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<AuctionSummaryDto>>builder().success(true).message("Auction search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<AuctionSummaryDto>>> filter(@RequestBody AuctionFilterDto filterDto) {
        List<AuctionSummaryDto> result = auctionService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<AuctionSummaryDto>>builder().success(true).message("Auction filter completed").data(result).build());
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<AuctionSummaryDto>>> getActiveAuctions() {
        List<AuctionSummaryDto> result = auctionService.getActiveAuctions();
        return ResponseEntity.ok(ApiResponse.<List<AuctionSummaryDto>>builder().success(true).message("Active auctions retrieved").data(result).build());
    }

}