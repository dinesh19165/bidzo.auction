package com.bidzo.service;

import com.bidzo.dto.customer.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface CustomerService {

    CustomerResponseDto create(CustomerCreateDto createDto);
    CustomerResponseDto update(CustomerUpdateDto updateDto);
    void delete(Long id);
    CustomerDetailsDto getById(Long id);
    List<CustomerSummaryDto> getAll();
    List<CustomerSummaryDto> search(CustomerSearchDto searchDto);
    List<CustomerSummaryDto> filter(CustomerFilterDto filterDto);
    CustomerDetailsDto getProfile(Long id);
}
