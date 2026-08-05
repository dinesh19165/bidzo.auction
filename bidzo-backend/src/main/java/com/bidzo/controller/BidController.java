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
import com.bidzo.service.BidService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.bid.*;

@RestController
@RequestMapping("/api/bids")
public class BidController {
    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @PostMapping("/place")
    public ResponseEntity<ApiResponse<BidResponseDto>> placeBid(@RequestBody BidCreateDto createDto) {
        BidResponseDto result = bidService.placeBid(createDto);
        return ResponseEntity.ok(ApiResponse.<BidResponseDto>builder().success(true).message("Bid placed").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<BidResponseDto>> update(@RequestBody BidUpdateDto updateDto) {
        BidResponseDto result = bidService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<BidResponseDto>builder().success(true).message("Bid updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        bidService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BidDetailsDto>> getById(@PathVariable Long id) {
        BidDetailsDto result = bidService.getById(id);
        return ResponseEntity.ok(ApiResponse.<BidDetailsDto>builder().success(true).message("Bid details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<BidSummaryDto>>> search(@RequestBody BidSearchDto searchDto) {
        List<BidSummaryDto> result = bidService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<BidSummaryDto>>builder().success(true).message("Bid search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<BidSummaryDto>>> filter(@RequestBody BidFilterDto filterDto) {
        List<BidSummaryDto> result = bidService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<BidSummaryDto>>builder().success(true).message("Bid filter completed").data(result).build());
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<ApiResponse<List<BidSummaryDto>>> getByAuction(@PathVariable Long auctionId) {
        List<BidSummaryDto> result = bidService.getByAuction(auctionId);
        return ResponseEntity.ok(ApiResponse.<List<BidSummaryDto>>builder().success(true).message("Bids by auction retrieved").data(result).build());
    }

}