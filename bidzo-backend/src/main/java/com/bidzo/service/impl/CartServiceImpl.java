package com.bidzo.service.impl;

import com.bidzo.dto.cart.*;
import com.bidzo.repository.CartItemRepository;
import com.bidzo.service.CartService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;

    public CartServiceImpl(CartItemRepository cartItemRepository) {
        this.cartItemRepository = cartItemRepository;
    }

    @Override
    public CartResponseDto addItem(CartCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public CartResponseDto updateItem(CartUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void removeItem(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public CartDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<CartSummaryDto> search(CartSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<CartSummaryDto> filter(CartFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
