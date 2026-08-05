package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Product;
import com.bidzo.dto.product.ProductCreateDto;
import com.bidzo.dto.product.ProductDetailsDto;
import com.bidzo.dto.product.ProductResponseDto;
import com.bidzo.dto.product.ProductUpdateDto;
import com.bidzo.dto.product.ProductSummaryDto;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    Product toEntity(ProductCreateDto dto);
    ProductDetailsDto toDetailsDto(Product entity);
    ProductResponseDto toResponseDto(Product entity);
    ProductSummaryDto toSummaryDto(Product entity);
    void updateFromDto(ProductUpdateDto dto, @MappingTarget Product entity);
}
