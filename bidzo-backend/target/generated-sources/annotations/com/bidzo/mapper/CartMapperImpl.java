package com.bidzo.mapper;

import com.bidzo.dto.cart.CartCreateDto;
import com.bidzo.dto.cart.CartDetailsDto;
import com.bidzo.dto.cart.CartResponseDto;
import com.bidzo.dto.cart.CartSummaryDto;
import com.bidzo.dto.cart.CartUpdateDto;
import com.bidzo.entity.Cart;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class CartMapperImpl implements CartMapper {

    @Override
    public Cart toEntity(CartCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Cart cart = new Cart();

        return cart;
    }

    @Override
    public CartDetailsDto toDetailsDto(Cart entity) {
        if ( entity == null ) {
            return null;
        }

        CartDetailsDto cartDetailsDto = new CartDetailsDto();

        return cartDetailsDto;
    }

    @Override
    public CartResponseDto toResponseDto(Cart entity) {
        if ( entity == null ) {
            return null;
        }

        CartResponseDto cartResponseDto = new CartResponseDto();

        return cartResponseDto;
    }

    @Override
    public CartSummaryDto toSummaryDto(Cart entity) {
        if ( entity == null ) {
            return null;
        }

        CartSummaryDto cartSummaryDto = new CartSummaryDto();

        return cartSummaryDto;
    }

    @Override
    public void updateFromDto(CartUpdateDto dto, Cart entity) {
        if ( dto == null ) {
            return;
        }
    }
}
