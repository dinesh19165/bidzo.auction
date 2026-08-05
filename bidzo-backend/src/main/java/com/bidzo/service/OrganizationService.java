package com.bidzo.service;

import com.bidzo.dto.organization.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface OrganizationService {

    OrganizationResponseDto create(OrganizationCreateDto createDto);
    OrganizationResponseDto update(OrganizationUpdateDto updateDto);
    void delete(Long id);
    OrganizationDetailsDto getById(Long id);
    List<OrganizationSummaryDto> getAll();
    List<OrganizationSummaryDto> search(OrganizationSearchDto searchDto);
    List<OrganizationSummaryDto> filter(OrganizationFilterDto filterDto);
}
