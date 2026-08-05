package com.bidzo.service;

import com.bidzo.dto.review.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface ReviewService {

    ReviewResponseDto create(ReviewCreateDto createDto);
    ReviewResponseDto update(ReviewUpdateDto updateDto);
    void delete(Long id);
    ReviewDetailsDto getById(Long id);
    List<ReviewSummaryDto> search(ReviewSearchDto searchDto);
    List<ReviewSummaryDto> filter(ReviewFilterDto filterDto);
}
