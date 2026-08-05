package com.bidzo.service;

import com.bidzo.dto.auth.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface AuthService {

    AuthResponseDto authenticate(AuthRequestDto requestDto);
    AuthResponseDto register(AuthCreateDto createDto);
    AuthResponseDto refreshToken(AuthRequestDto requestDto);
    AuthDetailsDto getById(Long id);
    List<AuthSummaryDto> getAll();
    List<AuthSummaryDto> search(AuthSearchDto searchDto);
    List<AuthSummaryDto> filter(AuthFilterDto filterDto);
}
