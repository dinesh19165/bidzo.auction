package com.bidzo.mapper;

import com.bidzo.dto.review.ReviewCreateDto;
import com.bidzo.dto.review.ReviewDetailsDto;
import com.bidzo.dto.review.ReviewResponseDto;
import com.bidzo.dto.review.ReviewSummaryDto;
import com.bidzo.dto.review.ReviewUpdateDto;
import com.bidzo.entity.Review;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class ReviewMapperImpl implements ReviewMapper {

    @Override
    public Review toEntity(ReviewCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Review review = new Review();

        return review;
    }

    @Override
    public ReviewDetailsDto toDetailsDto(Review entity) {
        if ( entity == null ) {
            return null;
        }

        ReviewDetailsDto reviewDetailsDto = new ReviewDetailsDto();

        return reviewDetailsDto;
    }

    @Override
    public ReviewResponseDto toResponseDto(Review entity) {
        if ( entity == null ) {
            return null;
        }

        ReviewResponseDto reviewResponseDto = new ReviewResponseDto();

        return reviewResponseDto;
    }

    @Override
    public ReviewSummaryDto toSummaryDto(Review entity) {
        if ( entity == null ) {
            return null;
        }

        ReviewSummaryDto reviewSummaryDto = new ReviewSummaryDto();

        return reviewSummaryDto;
    }

    @Override
    public void updateFromDto(ReviewUpdateDto dto, Review entity) {
        if ( dto == null ) {
            return;
        }
    }
}
