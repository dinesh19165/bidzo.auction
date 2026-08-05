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
import com.bidzo.service.WalletService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.wallet.*;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<WalletResponseDto>> create(@RequestBody WalletCreateDto createDto) {
        WalletResponseDto result = walletService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<WalletResponseDto>builder().success(true).message("Wallet created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<WalletResponseDto>> update(@RequestBody WalletUpdateDto updateDto) {
        WalletResponseDto result = walletService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<WalletResponseDto>builder().success(true).message("Wallet updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        walletService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WalletDetailsDto>> getById(@PathVariable Long id) {
        WalletDetailsDto result = walletService.getById(id);
        return ResponseEntity.ok(ApiResponse.<WalletDetailsDto>builder().success(true).message("Wallet details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<WalletSummaryDto>>> search(@RequestBody WalletSearchDto searchDto) {
        List<WalletSummaryDto> result = walletService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<WalletSummaryDto>>builder().success(true).message("Wallet search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<WalletSummaryDto>>> filter(@RequestBody WalletFilterDto filterDto) {
        List<WalletSummaryDto> result = walletService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<WalletSummaryDto>>builder().success(true).message("Wallet filter completed").data(result).build());
    }

}