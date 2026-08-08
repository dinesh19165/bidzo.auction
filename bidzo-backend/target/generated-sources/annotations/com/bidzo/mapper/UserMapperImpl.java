package com.bidzo.mapper;

import com.bidzo.dto.user.UserCreateDto;
import com.bidzo.dto.user.UserDetailsDto;
import com.bidzo.dto.user.UserResponseDto;
import com.bidzo.dto.user.UserSummaryDto;
import com.bidzo.dto.user.UserUpdateDto;
import com.bidzo.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(UserCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        User user = new User();

        return user;
    }

    @Override
    public UserDetailsDto toDetailsDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserDetailsDto userDetailsDto = new UserDetailsDto();

        return userDetailsDto;
    }

    @Override
    public UserResponseDto toResponseDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserResponseDto userResponseDto = new UserResponseDto();

        return userResponseDto;
    }

    @Override
    public UserSummaryDto toSummaryDto(User entity) {
        if ( entity == null ) {
            return null;
        }

        UserSummaryDto userSummaryDto = new UserSummaryDto();

        return userSummaryDto;
    }

    @Override
    public void updateFromDto(UserUpdateDto dto, User entity) {
        if ( dto == null ) {
            return;
        }
    }
}
