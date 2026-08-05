package com.bidzo.service.impl;

import com.bidzo.dto.organization.*;
import com.bidzo.repository.OrganizationRepository;
import com.bidzo.service.OrganizationService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Override
    public OrganizationResponseDto create(OrganizationCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public OrganizationResponseDto update(OrganizationUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public OrganizationDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<OrganizationSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<OrganizationSummaryDto> search(OrganizationSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<OrganizationSummaryDto> filter(OrganizationFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
