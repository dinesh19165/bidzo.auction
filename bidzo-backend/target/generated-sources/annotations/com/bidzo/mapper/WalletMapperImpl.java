package com.bidzo.mapper;

import com.bidzo.dto.wallet.WalletCreateDto;
import com.bidzo.dto.wallet.WalletDetailsDto;
import com.bidzo.dto.wallet.WalletResponseDto;
import com.bidzo.dto.wallet.WalletSummaryDto;
import com.bidzo.dto.wallet.WalletUpdateDto;
import com.bidzo.entity.WalletTransaction;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class WalletMapperImpl implements WalletMapper {

    @Override
    public WalletTransaction toEntity(WalletCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        WalletTransaction walletTransaction = new WalletTransaction();

        return walletTransaction;
    }

    @Override
    public WalletDetailsDto toDetailsDto(WalletTransaction entity) {
        if ( entity == null ) {
            return null;
        }

        WalletDetailsDto walletDetailsDto = new WalletDetailsDto();

        return walletDetailsDto;
    }

    @Override
    public WalletResponseDto toResponseDto(WalletTransaction entity) {
        if ( entity == null ) {
            return null;
        }

        WalletResponseDto walletResponseDto = new WalletResponseDto();

        return walletResponseDto;
    }

    @Override
    public WalletSummaryDto toSummaryDto(WalletTransaction entity) {
        if ( entity == null ) {
            return null;
        }

        WalletSummaryDto walletSummaryDto = new WalletSummaryDto();

        return walletSummaryDto;
    }

    @Override
    public void updateFromDto(WalletUpdateDto dto, WalletTransaction entity) {
        if ( dto == null ) {
            return;
        }
    }
}
