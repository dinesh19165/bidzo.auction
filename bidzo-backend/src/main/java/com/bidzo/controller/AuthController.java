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
import com.bidzo.service.AuthService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.auth.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDto>> login(@RequestBody AuthRequestDto requestDto) {
        AuthResponseDto result = authService.authenticate(requestDto);
        return ResponseEntity.ok(ApiResponse.<AuthResponseDto>builder().success(true).message("Login successful").data(result).build());
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDto>> register(@RequestBody AuthCreateDto createDto) {
        AuthResponseDto result = authService.register(createDto);
        return ResponseEntity.ok(ApiResponse.<AuthResponseDto>builder().success(true).message("Registration successful").data(result).build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponseDto>> refreshToken(@RequestBody AuthRequestDto requestDto) {
        AuthResponseDto result = authService.refreshToken(requestDto);
        return ResponseEntity.ok(ApiResponse.<AuthResponseDto>builder().success(true).message("Token refreshed").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuthDetailsDto>> getById(@PathVariable Long id) {
        AuthDetailsDto result = authService.getById(id);
        return ResponseEntity.ok(ApiResponse.<AuthDetailsDto>builder().success(true).message("Auth details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<AuthSummaryDto>>> getAll() {
        List<AuthSummaryDto> result = authService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<AuthSummaryDto>>builder().success(true).message("Auth list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<AuthSummaryDto>>> search(@RequestBody AuthSearchDto searchDto) {
        List<AuthSummaryDto> result = authService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<AuthSummaryDto>>builder().success(true).message("Auth search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<AuthSummaryDto>>> filter(@RequestBody AuthFilterDto filterDto) {
        List<AuthSummaryDto> result = authService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<AuthSummaryDto>>builder().success(true).message("Auth filter completed").data(result).build());
    }

}