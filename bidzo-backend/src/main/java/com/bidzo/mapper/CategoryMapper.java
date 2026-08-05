package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Category;
import com.bidzo.dto.category.CategoryCreateDto;
import com.bidzo.dto.category.CategoryDetailsDto;
import com.bidzo.dto.category.CategoryResponseDto;
import com.bidzo.dto.category.CategoryUpdateDto;
import com.bidzo.dto.category.CategorySummaryDto;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toEntity(CategoryCreateDto dto);
    CategoryDetailsDto toDetailsDto(Category entity);
    CategoryResponseDto toResponseDto(Category entity);
    CategorySummaryDto toSummaryDto(Category entity);
    void updateFromDto(CategoryUpdateDto dto, @MappingTarget Category entity);
}
