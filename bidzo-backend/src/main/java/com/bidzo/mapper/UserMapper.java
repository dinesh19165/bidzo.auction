package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.User;
import com.bidzo.dto.user.UserCreateDto;
import com.bidzo.dto.user.UserDetailsDto;
import com.bidzo.dto.user.UserResponseDto;
import com.bidzo.dto.user.UserUpdateDto;
import com.bidzo.dto.user.UserSummaryDto;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toEntity(UserCreateDto dto);
    UserDetailsDto toDetailsDto(User entity);
    UserResponseDto toResponseDto(User entity);
    UserSummaryDto toSummaryDto(User entity);
    void updateFromDto(UserUpdateDto dto, @MappingTarget User entity);
}
