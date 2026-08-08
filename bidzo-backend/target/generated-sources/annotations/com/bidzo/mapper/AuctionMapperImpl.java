package com.bidzo.mapper;

import com.bidzo.dto.auction.AuctionCreateDto;
import com.bidzo.dto.auction.AuctionDetailsDto;
import com.bidzo.dto.auction.AuctionResponseDto;
import com.bidzo.dto.auction.AuctionSummaryDto;
import com.bidzo.dto.auction.AuctionUpdateDto;
import com.bidzo.entity.Auction;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class AuctionMapperImpl implements AuctionMapper {

    @Override
    public Auction toEntity(AuctionCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Auction auction = new Auction();

        return auction;
    }

    @Override
    public AuctionDetailsDto toDetailsDto(Auction entity) {
        if ( entity == null ) {
            return null;
        }

        AuctionDetailsDto auctionDetailsDto = new AuctionDetailsDto();

        return auctionDetailsDto;
    }

    @Override
    public AuctionResponseDto toResponseDto(Auction entity) {
        if ( entity == null ) {
            return null;
        }

        AuctionResponseDto auctionResponseDto = new AuctionResponseDto();

        return auctionResponseDto;
    }

    @Override
    public AuctionSummaryDto toSummaryDto(Auction entity) {
        if ( entity == null ) {
            return null;
        }

        AuctionSummaryDto auctionSummaryDto = new AuctionSummaryDto();

        return auctionSummaryDto;
    }

    @Override
    public void updateFromDto(AuctionUpdateDto dto, Auction entity) {
        if ( dto == null ) {
            return;
        }
    }
}
