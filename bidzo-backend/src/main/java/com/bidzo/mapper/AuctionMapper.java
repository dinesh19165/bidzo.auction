package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Auction;
import com.bidzo.dto.auction.AuctionCreateDto;
import com.bidzo.dto.auction.AuctionDetailsDto;
import com.bidzo.dto.auction.AuctionResponseDto;
import com.bidzo.dto.auction.AuctionUpdateDto;
import com.bidzo.dto.auction.AuctionSummaryDto;

@Mapper(componentModel = "spring")
public interface AuctionMapper {
    Auction toEntity(AuctionCreateDto dto);
    AuctionDetailsDto toDetailsDto(Auction entity);
    AuctionResponseDto toResponseDto(Auction entity);
    AuctionSummaryDto toSummaryDto(Auction entity);
    void updateFromDto(AuctionUpdateDto dto, @MappingTarget Auction entity);
}
