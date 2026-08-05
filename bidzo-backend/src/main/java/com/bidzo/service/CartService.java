package com.bidzo.service;

import com.bidzo.dto.cart.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface CartService {

    CartResponseDto addItem(CartCreateDto createDto);
    CartResponseDto updateItem(CartUpdateDto updateDto);
    void removeItem(Long id);
    CartDetailsDto getById(Long id);
    List<CartSummaryDto> search(CartSearchDto searchDto);
    List<CartSummaryDto> filter(CartFilterDto filterDto);
}
