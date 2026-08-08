package com.bidzo.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.bidzo.dto.auction.AuctionCreateDto;
import com.bidzo.dto.auction.AuctionDetailsDto;
import com.bidzo.dto.auction.AuctionFilterDto;
import com.bidzo.dto.auction.AuctionResponseDto;
import com.bidzo.dto.auction.AuctionSearchDto;
import com.bidzo.dto.auction.AuctionSummaryDto;
import com.bidzo.dto.auction.AuctionUpdateDto;
import com.bidzo.service.AuctionService;

@Service
public class AuctionServiceImpl implements AuctionService {

    @Override
    public AuctionResponseDto create(AuctionCreateDto createDto) {
        return AuctionResponseDto.builder()
                .id(1L)
                .status("Auction Created Successfully")
                .build();
    }

    @Override
    public AuctionResponseDto update(Long id, AuctionUpdateDto updateDto) {
        return AuctionResponseDto.builder()
                .id(id)
                .status("Auction Updated Successfully")
                .build();
    }

    @Override
    public AuctionDetailsDto getById(Long id) {
        return new AuctionDetailsDto();
    }

    @Override
    public List<AuctionSummaryDto> getAll() {
        return new ArrayList<>();
    }

    @Override
    public List<AuctionSummaryDto> search(AuctionSearchDto searchDto) {
        return new ArrayList<>();
    }

    @Override
    public List<AuctionSummaryDto> filter(AuctionFilterDto filterDto) {
        return new ArrayList<>();
    }

    @Override
    public void delete(Long id) {
        // TODO
    }
}