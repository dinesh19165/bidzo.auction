package com.bidzo.service.impl;

import com.bidzo.dto.customer.*;
import com.bidzo.repository.CustomerProfileRepository;
import com.bidzo.service.CustomerService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerProfileRepository customerProfileRepository;

    public CustomerServiceImpl(CustomerProfileRepository customerProfileRepository) {
        this.customerProfileRepository = customerProfileRepository;
    }

    @Override
    public CustomerResponseDto create(CustomerCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public CustomerResponseDto update(CustomerUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public CustomerDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<CustomerSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<CustomerSummaryDto> search(CustomerSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<CustomerSummaryDto> filter(CustomerFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public CustomerDetailsDto getProfile(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
