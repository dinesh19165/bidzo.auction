package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Cart;
import com.bidzo.dto.cart.CartCreateDto;
import com.bidzo.dto.cart.CartDetailsDto;
import com.bidzo.dto.cart.CartResponseDto;
import com.bidzo.dto.cart.CartUpdateDto;
import com.bidzo.dto.cart.CartSummaryDto;

@Mapper(componentModel = "spring")
public interface CartMapper {
    Cart toEntity(CartCreateDto dto);
    CartDetailsDto toDetailsDto(Cart entity);
    CartResponseDto toResponseDto(Cart entity);
    CartSummaryDto toSummaryDto(Cart entity);
    void updateFromDto(CartUpdateDto dto, @MappingTarget Cart entity);
}
