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
import com.bidzo.service.CartService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.cart.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponseDto>> addItem(@RequestBody CartCreateDto createDto) {
        CartResponseDto result = cartService.addItem(createDto);
        return ResponseEntity.ok(ApiResponse.<CartResponseDto>builder().success(true).message("Item added to cart").data(result).build());
    }

    @PutMapping("/items")
    public ResponseEntity<ApiResponse<CartResponseDto>> updateItem(@RequestBody CartUpdateDto updateDto) {
        CartResponseDto result = cartService.updateItem(updateDto);
        return ResponseEntity.ok(ApiResponse.<CartResponseDto>builder().success(true).message("Cart item updated").data(result).build());
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Void>> removeItem(@PathVariable Long id) {
        cartService.removeItem(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CartDetailsDto>> getById(@PathVariable Long id) {
        CartDetailsDto result = cartService.getById(id);
        return ResponseEntity.ok(ApiResponse.<CartDetailsDto>builder().success(true).message("Cart details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<CartSummaryDto>>> search(@RequestBody CartSearchDto searchDto) {
        List<CartSummaryDto> result = cartService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<CartSummaryDto>>builder().success(true).message("Cart search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<CartSummaryDto>>> filter(@RequestBody CartFilterDto filterDto) {
        List<CartSummaryDto> result = cartService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<CartSummaryDto>>builder().success(true).message("Cart filter completed").data(result).build());
    }

}