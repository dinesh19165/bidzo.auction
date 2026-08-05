package com.bidzo.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.bidzo.entity.Message;
import com.bidzo.dto.message.MessageCreateDto;
import com.bidzo.dto.message.MessageDetailsDto;
import com.bidzo.dto.message.MessageResponseDto;
import com.bidzo.dto.message.MessageUpdateDto;
import com.bidzo.dto.message.MessageSummaryDto;

@Mapper(componentModel = "spring")
public interface MessageMapper {
    Message toEntity(MessageCreateDto dto);
    MessageDetailsDto toDetailsDto(Message entity);
    MessageResponseDto toResponseDto(Message entity);
    MessageSummaryDto toSummaryDto(Message entity);
    void updateFromDto(MessageUpdateDto dto, @MappingTarget Message entity);
}
