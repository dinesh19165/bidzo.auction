package com.bidzo.service;

import java.util.List;
import com.bidzo.dto.auction.*;

public interface AuctionService {

    AuctionResponseDto create(AuctionCreateDto createDto);

    AuctionResponseDto update(Long id, AuctionUpdateDto updateDto);

    AuctionDetailsDto getById(Long id);

    List<AuctionSummaryDto> getAll();

    List<AuctionSummaryDto> search(AuctionSearchDto searchDto);

    List<AuctionSummaryDto> filter(AuctionFilterDto filterDto);

    void delete(Long id);
}