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
import com.bidzo.service.ReviewService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.review.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ReviewResponseDto>> create(@RequestBody ReviewCreateDto createDto) {
        ReviewResponseDto result = reviewService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<ReviewResponseDto>builder().success(true).message("Review created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<ReviewResponseDto>> update(@RequestBody ReviewUpdateDto updateDto) {
        ReviewResponseDto result = reviewService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<ReviewResponseDto>builder().success(true).message("Review updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewDetailsDto>> getById(@PathVariable Long id) {
        ReviewDetailsDto result = reviewService.getById(id);
        return ResponseEntity.ok(ApiResponse.<ReviewDetailsDto>builder().success(true).message("Review details retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<ReviewSummaryDto>>> search(@RequestBody ReviewSearchDto searchDto) {
        List<ReviewSummaryDto> result = reviewService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<ReviewSummaryDto>>builder().success(true).message("Review search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<ReviewSummaryDto>>> filter(@RequestBody ReviewFilterDto filterDto) {
        List<ReviewSummaryDto> result = reviewService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<ReviewSummaryDto>>builder().success(true).message("Review filter completed").data(result).build());
    }

}