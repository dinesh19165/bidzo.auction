package com.bidzo.service.impl;

import com.bidzo.dto.auction.*;
import com.bidzo.repository.AuctionRepository;
import com.bidzo.service.AuctionService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;

    public AuctionServiceImpl(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }

    @Override
    public AuctionResponseDto create(AuctionCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public AuctionResponseDto update(AuctionUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public AuctionDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<AuctionSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<AuctionSummaryDto> search(AuctionSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<AuctionSummaryDto> filter(AuctionFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<AuctionSummaryDto> getActiveAuctions() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
