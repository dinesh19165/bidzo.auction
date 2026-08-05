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
import com.bidzo.service.DeliveryService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.delivery.*;

@RestController
@RequestMapping("/api/delivery")
public class DeliveryController {
    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> create(@RequestBody DeliveryCreateDto createDto) {
        DeliveryResponseDto result = deliveryService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<DeliveryResponseDto>builder().success(true).message("Delivery created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<DeliveryResponseDto>> update(@RequestBody DeliveryUpdateDto updateDto) {
        DeliveryResponseDto result = deliveryService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<DeliveryResponseDto>builder().success(true).message("Delivery updated").data(result).build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        deliveryService.cancel(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryDetailsDto>> getById(@PathVariable Long id) {
        DeliveryDetailsDto result = deliveryService.getById(id);
        return ResponseEntity.ok(ApiResponse.<DeliveryDetailsDto>builder().success(true).message("Delivery details retrieved").data(result).build());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<DeliverySummaryDto>>> getByOrder(@PathVariable Long orderId) {
        List<DeliverySummaryDto> result = deliveryService.getByOrder(orderId);
        return ResponseEntity.ok(ApiResponse.<List<DeliverySummaryDto>>builder().success(true).message("Deliveries by order retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<DeliverySummaryDto>>> search(@RequestBody DeliverySearchDto searchDto) {
        List<DeliverySummaryDto> result = deliveryService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<DeliverySummaryDto>>builder().success(true).message("Delivery search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<DeliverySummaryDto>>> filter(@RequestBody DeliveryFilterDto filterDto) {
        List<DeliverySummaryDto> result = deliveryService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<DeliverySummaryDto>>builder().success(true).message("Delivery filter completed").data(result).build());
    }

}