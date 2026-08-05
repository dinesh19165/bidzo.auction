package com.bidzo.service.impl;

import com.bidzo.dto.product.*;
import com.bidzo.repository.ProductRepository;
import com.bidzo.service.ProductService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductResponseDto create(ProductCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public ProductResponseDto update(ProductUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public ProductDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ProductSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ProductSummaryDto> search(ProductSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ProductSummaryDto> filter(ProductFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ProductSummaryDto> getByCategory(Long categoryId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
