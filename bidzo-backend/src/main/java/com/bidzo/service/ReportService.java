package com.bidzo.service;

import com.bidzo.dto.report.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface ReportService {

    ReportResponseDto generateReport(ReportCreateDto createDto);
    ReportDetailsDto getById(Long id);
    List<ReportSummaryDto> search(ReportSearchDto searchDto);
    List<ReportSummaryDto> filter(ReportFilterDto filterDto);
}
