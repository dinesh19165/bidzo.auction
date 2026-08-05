package com.bidzo.service;

import com.bidzo.dto.brand.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface BrandService {

    BrandResponseDto create(BrandCreateDto createDto);
    BrandResponseDto update(BrandUpdateDto updateDto);
    void delete(Long id);
    BrandDetailsDto getById(Long id);
    List<BrandSummaryDto> getAll();
    List<BrandSummaryDto> search(BrandSearchDto searchDto);
    List<BrandSummaryDto> filter(BrandFilterDto filterDto);
}
