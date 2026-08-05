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
import com.bidzo.service.MessageService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.message.*;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageResponseDto>> send(@RequestBody MessageCreateDto createDto) {
        MessageResponseDto result = messageService.send(createDto);
        return ResponseEntity.ok(ApiResponse.<MessageResponseDto>builder().success(true).message("Message sent").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MessageDetailsDto>> getById(@PathVariable Long id) {
        MessageDetailsDto result = messageService.getById(id);
        return ResponseEntity.ok(ApiResponse.<MessageDetailsDto>builder().success(true).message("Message details retrieved").data(result).build());
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageSummaryDto>>> getConversationMessages(@PathVariable Long conversationId) {
        List<MessageSummaryDto> result = messageService.getConversationMessages(conversationId);
        return ResponseEntity.ok(ApiResponse.<List<MessageSummaryDto>>builder().success(true).message("Conversation messages retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<MessageSummaryDto>>> search(@RequestBody MessageSearchDto searchDto) {
        List<MessageSummaryDto> result = messageService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<MessageSummaryDto>>builder().success(true).message("Message search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<MessageSummaryDto>>> filter(@RequestBody MessageFilterDto filterDto) {
        List<MessageSummaryDto> result = messageService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<MessageSummaryDto>>builder().success(true).message("Message filter completed").data(result).build());
    }

}