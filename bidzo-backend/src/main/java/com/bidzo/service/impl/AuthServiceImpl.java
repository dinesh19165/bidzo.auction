package com.bidzo.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.bidzo.dto.auth.AuthCreateDto;
import com.bidzo.dto.auth.AuthDetailsDto;
import com.bidzo.dto.auth.AuthFilterDto;
import com.bidzo.dto.auth.AuthRequestDto;
import com.bidzo.dto.auth.AuthResponseDto;
import com.bidzo.dto.auth.AuthSearchDto;
import com.bidzo.dto.auth.AuthSummaryDto;
import com.bidzo.repository.RefreshTokenRepository;
import com.bidzo.repository.UserRepository;
import com.bidzo.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthServiceImpl(UserRepository userRepository,
                           RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public AuthResponseDto authenticate(AuthRequestDto requestDto) {
        return AuthResponseDto.builder()
                .id(1L)
                .status("Login Successful")
                .build();
    }

    @Override
    public AuthResponseDto register(AuthCreateDto createDto) {
        return AuthResponseDto.builder()
                .id(1L)
                .status("Registration Successful")
                .build();
    }

    @Override
    public AuthResponseDto refreshToken(AuthRequestDto requestDto) {
        return AuthResponseDto.builder()
                .id(1L)
                .status("Token Refreshed")
                .build();
    }

    @Override
    public AuthDetailsDto getById(Long id) {
        return new AuthDetailsDto();
    }

    @Override
    public List<AuthSummaryDto> getAll() {
        return new ArrayList<>();
    }

    @Override
    public List<AuthSummaryDto> search(AuthSearchDto searchDto) {
        return new ArrayList<>();
    }

    @Override
    public List<AuthSummaryDto> filter(AuthFilterDto filterDto) {
        return new ArrayList<>();
    }
}