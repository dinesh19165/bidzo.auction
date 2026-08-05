package com.bidzo.service.impl;

import com.bidzo.dto.cms.*;
import com.bidzo.repository.CMSComponentRepository;
import com.bidzo.repository.CMSSectionRepository;
import com.bidzo.repository.PageSEORepository;
import com.bidzo.service.CmsService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CmsServiceImpl implements CmsService {

    private final CMSSectionRepository cMSSectionRepository;
    private final CMSComponentRepository cMSComponentRepository;
    private final PageSEORepository pageSEORepository;

    public CmsServiceImpl(CMSSectionRepository cMSSectionRepository, CMSComponentRepository cMSComponentRepository, PageSEORepository pageSEORepository) {
        this.cMSSectionRepository = cMSSectionRepository;
        this.cMSComponentRepository = cMSComponentRepository;
        this.pageSEORepository = pageSEORepository;
    }

    @Override
    public CmsResponseDto create(CmsCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public CmsResponseDto update(CmsUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void publish(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public CmsDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<CmsSummaryDto> search(CmsSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<CmsSummaryDto> filter(CmsFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
