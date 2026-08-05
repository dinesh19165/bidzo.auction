package com.bidzo.service.impl;

import com.bidzo.dto.franchise.*;
import com.bidzo.repository.FranchiseRepository;
import com.bidzo.service.FranchiseService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class FranchiseServiceImpl implements FranchiseService {

    private final FranchiseRepository franchiseRepository;

    public FranchiseServiceImpl(FranchiseRepository franchiseRepository) {
        this.franchiseRepository = franchiseRepository;
    }

    @Override
    public FranchiseResponseDto create(FranchiseCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public FranchiseResponseDto update(FranchiseUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public FranchiseDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<FranchiseSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<FranchiseSummaryDto> search(FranchiseSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<FranchiseSummaryDto> filter(FranchiseFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<FranchiseSummaryDto> getByOrganization(Long organizationId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
