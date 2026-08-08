package com.bidzo.mapper;

import com.bidzo.dto.product.ProductCreateDto;
import com.bidzo.dto.product.ProductDetailsDto;
import com.bidzo.dto.product.ProductResponseDto;
import com.bidzo.dto.product.ProductSummaryDto;
import com.bidzo.dto.product.ProductUpdateDto;
import com.bidzo.entity.Product;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class ProductMapperImpl implements ProductMapper {

    @Override
    public Product toEntity(ProductCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Product product = new Product();

        return product;
    }

    @Override
    public ProductDetailsDto toDetailsDto(Product entity) {
        if ( entity == null ) {
            return null;
        }

        ProductDetailsDto productDetailsDto = new ProductDetailsDto();

        return productDetailsDto;
    }

    @Override
    public ProductResponseDto toResponseDto(Product entity) {
        if ( entity == null ) {
            return null;
        }

        ProductResponseDto productResponseDto = new ProductResponseDto();

        return productResponseDto;
    }

    @Override
    public ProductSummaryDto toSummaryDto(Product entity) {
        if ( entity == null ) {
            return null;
        }

        ProductSummaryDto productSummaryDto = new ProductSummaryDto();

        return productSummaryDto;
    }

    @Override
    public void updateFromDto(ProductUpdateDto dto, Product entity) {
        if ( dto == null ) {
            return;
        }
    }
}
