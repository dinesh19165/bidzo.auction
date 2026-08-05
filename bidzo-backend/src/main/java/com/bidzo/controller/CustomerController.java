package com.bidzo.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.bidzo.service.CustomerService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.customer.*;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> create(@RequestBody CustomerCreateDto createDto) {
        CustomerResponseDto result = customerService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<CustomerResponseDto>builder().success(true).message("Customer created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CustomerResponseDto>> update(@RequestBody CustomerUpdateDto updateDto) {
        CustomerResponseDto result = customerService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<CustomerResponseDto>builder().success(true).message("Customer updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerDetailsDto>> getById(@PathVariable Long id) {
        CustomerDetailsDto result = customerService.getById(id);
        return ResponseEntity.ok(ApiResponse.<CustomerDetailsDto>builder().success(true).message("Customer details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<CustomerSummaryDto>>> getAll() {
        List<CustomerSummaryDto> result = customerService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<CustomerSummaryDto>>builder().success(true).message("Customer list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<CustomerSummaryDto>>> search(@RequestBody CustomerSearchDto searchDto) {
        List<CustomerSummaryDto> result = customerService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<CustomerSummaryDto>>builder().success(true).message("Customer search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<CustomerSummaryDto>>> filter(@RequestBody CustomerFilterDto filterDto) {
        List<CustomerSummaryDto> result = customerService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<CustomerSummaryDto>>builder().success(true).message("Customer filter completed").data(result).build());
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<ApiResponse<CustomerDetailsDto>> getProfile(@PathVariable Long id) {
        CustomerDetailsDto result = customerService.getProfile(id);
        return ResponseEntity.ok(ApiResponse.<CustomerDetailsDto>builder().success(true).message("Customer profile retrieved").data(result).build());
    }

}