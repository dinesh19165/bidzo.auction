package com.bidzo.service;

import com.bidzo.dto.cms.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface CmsService {

    CmsResponseDto create(CmsCreateDto createDto);
    CmsResponseDto update(CmsUpdateDto updateDto);
    void publish(Long id);
    CmsDetailsDto getById(Long id);
    List<CmsSummaryDto> search(CmsSearchDto searchDto);
    List<CmsSummaryDto> filter(CmsFilterDto filterDto);
}
