package com.bidzo.service;

import com.bidzo.dto.product.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface ProductService {

    ProductResponseDto create(ProductCreateDto createDto);
    ProductResponseDto update(ProductUpdateDto updateDto);
    void delete(Long id);
    ProductDetailsDto getById(Long id);
    List<ProductSummaryDto> getAll();
    List<ProductSummaryDto> search(ProductSearchDto searchDto);
    List<ProductSummaryDto> filter(ProductFilterDto filterDto);
    List<ProductSummaryDto> getByCategory(Long categoryId);
}
