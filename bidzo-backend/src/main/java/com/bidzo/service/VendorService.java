package com.bidzo.service;

import com.bidzo.dto.vendor.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface VendorService {

    VendorResponseDto create(VendorCreateDto createDto);
    VendorResponseDto update(VendorUpdateDto updateDto);
    void delete(Long id);
    VendorDetailsDto getById(Long id);
    List<VendorSummaryDto> getAll();
    List<VendorSummaryDto> search(VendorSearchDto searchDto);
    List<VendorSummaryDto> filter(VendorFilterDto filterDto);
    VendorDetailsDto getByUserId(Long userId);
}
