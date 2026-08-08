package com.bidzo.mapper;

import com.bidzo.dto.message.MessageCreateDto;
import com.bidzo.dto.message.MessageDetailsDto;
import com.bidzo.dto.message.MessageResponseDto;
import com.bidzo.dto.message.MessageSummaryDto;
import com.bidzo.dto.message.MessageUpdateDto;
import com.bidzo.entity.Message;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-07T17:58:13+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Eclipse Adoptium)"
)
@Component
public class MessageMapperImpl implements MessageMapper {

    @Override
    public Message toEntity(MessageCreateDto dto) {
        if ( dto == null ) {
            return null;
        }

        Message message = new Message();

        return message;
    }

    @Override
    public MessageDetailsDto toDetailsDto(Message entity) {
        if ( entity == null ) {
            return null;
        }

        MessageDetailsDto messageDetailsDto = new MessageDetailsDto();

        return messageDetailsDto;
    }

    @Override
    public MessageResponseDto toResponseDto(Message entity) {
        if ( entity == null ) {
            return null;
        }

        MessageResponseDto messageResponseDto = new MessageResponseDto();

        return messageResponseDto;
    }

    @Override
    public MessageSummaryDto toSummaryDto(Message entity) {
        if ( entity == null ) {
            return null;
        }

        MessageSummaryDto messageSummaryDto = new MessageSummaryDto();

        return messageSummaryDto;
    }

    @Override
    public void updateFromDto(MessageUpdateDto dto, Message entity) {
        if ( dto == null ) {
            return;
        }
    }
}
