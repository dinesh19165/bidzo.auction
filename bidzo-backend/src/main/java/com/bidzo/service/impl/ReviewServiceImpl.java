package com.bidzo.service.impl;

import com.bidzo.dto.review.*;
import com.bidzo.repository.ReviewRepository;
import com.bidzo.service.ReviewService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Override
    public ReviewResponseDto create(ReviewCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public ReviewResponseDto update(ReviewUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public ReviewDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ReviewSummaryDto> search(ReviewSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ReviewSummaryDto> filter(ReviewFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
