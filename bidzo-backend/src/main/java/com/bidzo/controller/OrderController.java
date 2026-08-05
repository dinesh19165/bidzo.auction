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
import com.bidzo.service.OrderService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.order.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/place")
    public ResponseEntity<ApiResponse<OrderResponseDto>> placeOrder(@RequestBody OrderCreateDto createDto) {
        OrderResponseDto result = orderService.placeOrder(createDto);
        return ResponseEntity.ok(ApiResponse.<OrderResponseDto>builder().success(true).message("Order placed").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<OrderResponseDto>> update(@RequestBody OrderUpdateDto updateDto) {
        OrderResponseDto result = orderService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<OrderResponseDto>builder().success(true).message("Order updated").data(result).build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        orderService.cancel(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailsDto>> getById(@PathVariable Long id) {
        OrderDetailsDto result = orderService.getById(id);
        return ResponseEntity.ok(ApiResponse.<OrderDetailsDto>builder().success(true).message("Order details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<OrderSummaryDto>>> getAll() {
        List<OrderSummaryDto> result = orderService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<OrderSummaryDto>>builder().success(true).message("Order list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<OrderSummaryDto>>> search(@RequestBody OrderSearchDto searchDto) {
        List<OrderSummaryDto> result = orderService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<OrderSummaryDto>>builder().success(true).message("Order search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<OrderSummaryDto>>> filter(@RequestBody OrderFilterDto filterDto) {
        List<OrderSummaryDto> result = orderService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<OrderSummaryDto>>builder().success(true).message("Order filter completed").data(result).build());
    }

}