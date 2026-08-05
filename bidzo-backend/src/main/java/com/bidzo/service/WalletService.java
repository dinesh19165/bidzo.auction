package com.bidzo.service;

import com.bidzo.dto.wallet.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface WalletService {

    WalletResponseDto create(WalletCreateDto createDto);
    WalletResponseDto update(WalletUpdateDto updateDto);
    void delete(Long id);
    WalletDetailsDto getById(Long id);
    List<WalletSummaryDto> search(WalletSearchDto searchDto);
    List<WalletSummaryDto> filter(WalletFilterDto filterDto);
}
