package com.bidzo.service;

import com.bidzo.dto.user.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface UserService {

    UserResponseDto create(UserCreateDto createDto);
    UserResponseDto update(UserUpdateDto updateDto);
    void delete(Long id);
    UserDetailsDto getById(Long id);
    List<UserSummaryDto> getAll();
    List<UserSummaryDto> search(UserSearchDto searchDto);
    List<UserSummaryDto> filter(UserFilterDto filterDto);
    UserDetailsDto findByEmail(String email);
}
