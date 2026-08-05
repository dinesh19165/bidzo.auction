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
import com.bidzo.service.ProductService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.product.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ProductResponseDto>> create(@RequestBody ProductCreateDto createDto) {
        ProductResponseDto result = productService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<ProductResponseDto>builder().success(true).message("Product created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<ProductResponseDto>> update(@RequestBody ProductUpdateDto updateDto) {
        ProductResponseDto result = productService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<ProductResponseDto>builder().success(true).message("Product updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailsDto>> getById(@PathVariable Long id) {
        ProductDetailsDto result = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.<ProductDetailsDto>builder().success(true).message("Product details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<ProductSummaryDto>>> getAll() {
        List<ProductSummaryDto> result = productService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<ProductSummaryDto>>builder().success(true).message("Product list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductSummaryDto>>> search(@RequestBody ProductSearchDto searchDto) {
        List<ProductSummaryDto> result = productService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<ProductSummaryDto>>builder().success(true).message("Product search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<ProductSummaryDto>>> filter(@RequestBody ProductFilterDto filterDto) {
        List<ProductSummaryDto> result = productService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<ProductSummaryDto>>builder().success(true).message("Product filter completed").data(result).build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ProductSummaryDto>>> getByCategory(@PathVariable Long categoryId) {
        List<ProductSummaryDto> result = productService.getByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.<List<ProductSummaryDto>>builder().success(true).message("Products by category retrieved").data(result).build());
    }

}