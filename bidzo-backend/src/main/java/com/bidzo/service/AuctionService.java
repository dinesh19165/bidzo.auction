package com.bidzo.service;

import com.bidzo.dto.auction.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface AuctionService {

    AuctionResponseDto create(AuctionCreateDto createDto);
    AuctionResponseDto update(AuctionUpdateDto updateDto);
    void delete(Long id);
    AuctionDetailsDto getById(Long id);
    List<AuctionSummaryDto> getAll();
    List<AuctionSummaryDto> search(AuctionSearchDto searchDto);
    List<AuctionSummaryDto> filter(AuctionFilterDto filterDto);
    List<AuctionSummaryDto> getActiveAuctions();
}
