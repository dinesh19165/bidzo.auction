package com.bidzo.service.impl;

import com.bidzo.dto.bid.*;
import com.bidzo.repository.BidRepository;
import com.bidzo.service.BidService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BidServiceImpl implements BidService {

    private final BidRepository bidRepository;

    public BidServiceImpl(BidRepository bidRepository) {
        this.bidRepository = bidRepository;
    }

    @Override
    public BidResponseDto placeBid(BidCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public BidResponseDto update(BidUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public BidDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<BidSummaryDto> search(BidSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<BidSummaryDto> filter(BidFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<BidSummaryDto> getByAuction(Long auctionId) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
