package com.bidzo.service;

import com.bidzo.dto.category.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface CategoryService {

    CategoryResponseDto create(CategoryCreateDto createDto);
    CategoryResponseDto update(CategoryUpdateDto updateDto);
    void delete(Long id);
    CategoryDetailsDto getById(Long id);
    List<CategorySummaryDto> getAll();
    List<CategorySummaryDto> search(CategorySearchDto searchDto);
    List<CategorySummaryDto> filter(CategoryFilterDto filterDto);
}
