package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Review;
import com.bidzo.dto.review.ReviewCreateDto;
import com.bidzo.dto.review.ReviewDetailsDto;
import com.bidzo.dto.review.ReviewResponseDto;
import com.bidzo.dto.review.ReviewUpdateDto;
import com.bidzo.dto.review.ReviewSummaryDto;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    Review toEntity(ReviewCreateDto dto);
    ReviewDetailsDto toDetailsDto(Review entity);
    ReviewResponseDto toResponseDto(Review entity);
    ReviewSummaryDto toSummaryDto(Review entity);
    void updateFromDto(ReviewUpdateDto dto, @MappingTarget Review entity);
}
