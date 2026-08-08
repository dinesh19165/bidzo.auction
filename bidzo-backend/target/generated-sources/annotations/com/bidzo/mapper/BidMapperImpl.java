package com.bidzo.mapper;

import com.bidzo.dto.bid.BidCreateDto;
import com.bidzo.dto.bid.BidDetailsDto;
import com.bidzo.dto.bid.BidResponseDto;
import com.bidzo.dto.bid.BidSummaryDto;
import com.bidzo.dto.bid.BidUpdateDto;
import com.bidzo.entity.Bid;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:12+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class BidMapperImpl implements BidMapper {

    @Override
    public Bid toEntity(BidCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Bid bid = new Bid();

        return bid;
    }

    @Override
    public BidDetailsDto toDetailsDto(Bid entity) {
        if ( entity == null ) {
            return null;
        }

        BidDetailsDto bidDetailsDto = new BidDetailsDto();

        return bidDetailsDto;
    }

    @Override
    public BidResponseDto toResponseDto(Bid entity) {
        if ( entity == null ) {
            return null;
        }

        BidResponseDto bidResponseDto = new BidResponseDto();

        return bidResponseDto;
    }

    @Override
    public BidSummaryDto toSummaryDto(Bid entity) {
        if ( entity == null ) {
            return null;
        }

        BidSummaryDto bidSummaryDto = new BidSummaryDto();

        return bidSummaryDto;
    }

    @Override
    public void updateFromDto(BidUpdateDto dto, Bid entity) {
        if ( dto == null ) {
            return;
        }
    }
}
