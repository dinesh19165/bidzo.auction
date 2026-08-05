package com.bidzo.service.impl;

import com.bidzo.dto.report.*;
import com.bidzo.repository.ActivityLogRepository;
import com.bidzo.repository.AuditLogRepository;
import com.bidzo.service.ReportService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ReportServiceImpl implements ReportService {

    private final AuditLogRepository auditLogRepository;
    private final ActivityLogRepository activityLogRepository;

    public ReportServiceImpl(AuditLogRepository auditLogRepository, ActivityLogRepository activityLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public ReportResponseDto generateReport(ReportCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public ReportDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ReportSummaryDto> search(ReportSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<ReportSummaryDto> filter(ReportFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
