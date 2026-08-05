package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.WalletTransaction;
import com.bidzo.dto.wallet.WalletCreateDto;
import com.bidzo.dto.wallet.WalletDetailsDto;
import com.bidzo.dto.wallet.WalletResponseDto;
import com.bidzo.dto.wallet.WalletUpdateDto;
import com.bidzo.dto.wallet.WalletSummaryDto;

@Mapper(componentModel = "spring")
public interface WalletMapper {
    WalletTransaction toEntity(WalletCreateDto dto);
    WalletDetailsDto toDetailsDto(WalletTransaction entity);
    WalletResponseDto toResponseDto(WalletTransaction entity);
    WalletSummaryDto toSummaryDto(WalletTransaction entity);
    void updateFromDto(WalletUpdateDto dto, @MappingTarget WalletTransaction entity);
}
