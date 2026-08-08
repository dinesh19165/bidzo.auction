package com.bidzo.mapper;

import com.bidzo.dto.category.CategoryCreateDto;
import com.bidzo.dto.category.CategoryDetailsDto;
import com.bidzo.dto.category.CategoryResponseDto;
import com.bidzo.dto.category.CategorySummaryDto;
import com.bidzo.dto.category.CategoryUpdateDto;
import com.bidzo.entity.Category;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class CategoryMapperImpl implements CategoryMapper {

    @Override
    public Category toEntity(CategoryCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Category category = new Category();

        return category;
    }

    @Override
    public CategoryDetailsDto toDetailsDto(Category entity) {
        if ( entity == null ) {
            return null;
        }

        CategoryDetailsDto categoryDetailsDto = new CategoryDetailsDto();

        return categoryDetailsDto;
    }

    @Override
    public CategoryResponseDto toResponseDto(Category entity) {
        if ( entity == null ) {
            return null;
        }

        CategoryResponseDto categoryResponseDto = new CategoryResponseDto();

        return categoryResponseDto;
    }

    @Override
    public CategorySummaryDto toSummaryDto(Category entity) {
        if ( entity == null ) {
            return null;
        }

        CategorySummaryDto categorySummaryDto = new CategorySummaryDto();

        return categorySummaryDto;
    }

    @Override
    public void updateFromDto(CategoryUpdateDto dto, Category entity) {
        if ( dto == null ) {
            return;
        }
    }
}
