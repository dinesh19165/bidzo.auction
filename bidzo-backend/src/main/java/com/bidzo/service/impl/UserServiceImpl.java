package com.bidzo.service.impl;

import com.bidzo.dto.user.*;
import com.bidzo.repository.UserRepository;
import com.bidzo.service.UserService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponseDto create(UserCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public UserResponseDto update(UserUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public UserDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<UserSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<UserSummaryDto> search(UserSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<UserSummaryDto> filter(UserFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public UserDetailsDto findByEmail(String email) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
