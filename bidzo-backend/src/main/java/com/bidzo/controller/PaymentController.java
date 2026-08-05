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
import com.bidzo.service.PaymentService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.payment.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> processPayment(@RequestBody PaymentCreateDto createDto) {
        PaymentResponseDto result = paymentService.processPayment(createDto);
        return ResponseEntity.ok(ApiResponse.<PaymentResponseDto>builder().success(true).message("Payment processed").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> update(@RequestBody PaymentUpdateDto updateDto) {
        PaymentResponseDto result = paymentService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<PaymentResponseDto>builder().success(true).message("Payment updated").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDetailsDto>> getById(@PathVariable Long id) {
        PaymentDetailsDto result = paymentService.getById(id);
        return ResponseEntity.ok(ApiResponse.<PaymentDetailsDto>builder().success(true).message("Payment details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<PaymentSummaryDto>>> search(@RequestBody PaymentSearchDto searchDto) {
        List<PaymentSummaryDto> result = paymentService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<PaymentSummaryDto>>builder().success(true).message("Payment search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<PaymentSummaryDto>>> filter(@RequestBody PaymentFilterDto filterDto) {
        List<PaymentSummaryDto> result = paymentService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<PaymentSummaryDto>>builder().success(true).message("Payment filter completed").data(result).build());
    }

}