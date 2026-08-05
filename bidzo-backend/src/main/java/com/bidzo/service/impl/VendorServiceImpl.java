package com.bidzo.service.impl;

import com.bidzo.dto.vendor.*;
import com.bidzo.repository.VendorProfileRepository;
import com.bidzo.service.VendorService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class VendorServiceImpl implements VendorService {

    private final VendorProfileRepository vendorProfileRepository;

    public VendorServiceImpl(VendorProfileRepository vendorProfileRepository) {
        this.vendorProfileRepository = vendorProfileRepository;
    }

    @Override
    public VendorResponseDto create(VendorCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public VendorResponseDto update(VendorUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public VendorDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<VendorSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<VendorSummaryDto> search(VendorSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<VendorSummaryDto> filter(VendorFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public VendorDetailsDto getByUserId(Long userId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
