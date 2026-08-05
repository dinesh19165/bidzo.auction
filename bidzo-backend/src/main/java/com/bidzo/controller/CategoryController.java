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
import com.bidzo.service.CategoryService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.category.*;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> create(@RequestBody CategoryCreateDto createDto) {
        CategoryResponseDto result = categoryService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<CategoryResponseDto>builder().success(true).message("Category created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CategoryResponseDto>> update(@RequestBody CategoryUpdateDto updateDto) {
        CategoryResponseDto result = categoryService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<CategoryResponseDto>builder().success(true).message("Category updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDetailsDto>> getById(@PathVariable Long id) {
        CategoryDetailsDto result = categoryService.getById(id);
        return ResponseEntity.ok(ApiResponse.<CategoryDetailsDto>builder().success(true).message("Category details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> getAll() {
        List<CategorySummaryDto> result = categoryService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<CategorySummaryDto>>builder().success(true).message("Category list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> search(@RequestBody CategorySearchDto searchDto) {
        List<CategorySummaryDto> result = categoryService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<CategorySummaryDto>>builder().success(true).message("Category search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<CategorySummaryDto>>> filter(@RequestBody CategoryFilterDto filterDto) {
        List<CategorySummaryDto> result = categoryService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<CategorySummaryDto>>builder().success(true).message("Category filter completed").data(result).build());
    }

}