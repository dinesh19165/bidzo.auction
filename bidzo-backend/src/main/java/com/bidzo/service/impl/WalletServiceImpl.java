package com.bidzo.service.impl;

import com.bidzo.dto.wallet.*;
import com.bidzo.repository.CustomerWalletRepository;
import com.bidzo.repository.VendorWalletRepository;
import com.bidzo.repository.WalletTransactionRepository;
import com.bidzo.service.WalletService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class WalletServiceImpl implements WalletService {

    private final CustomerWalletRepository customerWalletRepository;
    private final VendorWalletRepository vendorWalletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public WalletServiceImpl(CustomerWalletRepository customerWalletRepository, VendorWalletRepository vendorWalletRepository, WalletTransactionRepository walletTransactionRepository) {
        this.customerWalletRepository = customerWalletRepository;
        this.vendorWalletRepository = vendorWalletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
    }

    @Override
    public WalletResponseDto create(WalletCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public WalletResponseDto update(WalletUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public WalletDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<WalletSummaryDto> search(WalletSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<WalletSummaryDto> filter(WalletFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
