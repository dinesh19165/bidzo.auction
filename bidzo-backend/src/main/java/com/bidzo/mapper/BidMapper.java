package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Bid;
import com.bidzo.dto.bid.BidCreateDto;
import com.bidzo.dto.bid.BidDetailsDto;
import com.bidzo.dto.bid.BidResponseDto;
import com.bidzo.dto.bid.BidUpdateDto;
import com.bidzo.dto.bid.BidSummaryDto;

@Mapper(componentModel = "spring")
public interface BidMapper {
    Bid toEntity(BidCreateDto dto);
    BidDetailsDto toDetailsDto(Bid entity);
    BidResponseDto toResponseDto(Bid entity);
    BidSummaryDto toSummaryDto(Bid entity);
    void updateFromDto(BidUpdateDto dto, @MappingTarget Bid entity);
}
