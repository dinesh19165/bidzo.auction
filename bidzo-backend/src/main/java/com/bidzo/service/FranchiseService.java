package com.bidzo.service;

import com.bidzo.dto.franchise.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface FranchiseService {

    FranchiseResponseDto create(FranchiseCreateDto createDto);
    FranchiseResponseDto update(FranchiseUpdateDto updateDto);
    void delete(Long id);
    FranchiseDetailsDto getById(Long id);
    List<FranchiseSummaryDto> getAll();
    List<FranchiseSummaryDto> search(FranchiseSearchDto searchDto);
    List<FranchiseSummaryDto> filter(FranchiseFilterDto filterDto);
    List<FranchiseSummaryDto> getByOrganization(Long organizationId);
}
