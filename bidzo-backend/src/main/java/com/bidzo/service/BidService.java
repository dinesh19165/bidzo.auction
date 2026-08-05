package com.bidzo.service;

import com.bidzo.dto.bid.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface BidService {

    BidResponseDto placeBid(BidCreateDto createDto);
    BidResponseDto update(BidUpdateDto updateDto);
    void delete(Long id);
    BidDetailsDto getById(Long id);
    List<BidSummaryDto> search(BidSearchDto searchDto);
    List<BidSummaryDto> filter(BidFilterDto filterDto);
    List<BidSummaryDto> getByAuction(Long auctionId);
}
