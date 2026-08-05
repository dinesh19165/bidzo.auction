package com.bidzo.service.impl;

import com.bidzo.dto.auth.*;
import com.bidzo.repository.RefreshTokenRepository;
import com.bidzo.repository.UserRepository;
import com.bidzo.service.AuthService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthServiceImpl(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Override
    public AuthResponseDto authenticate(AuthRequestDto requestDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public AuthResponseDto register(AuthCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public AuthResponseDto refreshToken(AuthRequestDto requestDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public AuthDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<AuthSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<AuthSummaryDto> search(AuthSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<AuthSummaryDto> filter(AuthFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
