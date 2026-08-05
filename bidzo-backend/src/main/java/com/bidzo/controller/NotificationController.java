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
import com.bidzo.service.NotificationService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.notification.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<NotificationResponseDto>> create(@RequestBody NotificationCreateDto createDto) {
        NotificationResponseDto result = notificationService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<NotificationResponseDto>builder().success(true).message("Notification created").data(result).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationDetailsDto>> getById(@PathVariable Long id) {
        NotificationDetailsDto result = notificationService.getById(id);
        return ResponseEntity.ok(ApiResponse.<NotificationDetailsDto>builder().success(true).message("Notification details retrieved").data(result).build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationSummaryDto>>> getForUser(@PathVariable Long userId) {
        List<NotificationSummaryDto> result = notificationService.getForUser(userId);
        return ResponseEntity.ok(ApiResponse.<List<NotificationSummaryDto>>builder().success(true).message("User notifications retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<NotificationSummaryDto>>> search(@RequestBody NotificationSearchDto searchDto) {
        List<NotificationSummaryDto> result = notificationService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<NotificationSummaryDto>>builder().success(true).message("Notification search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<NotificationSummaryDto>>> filter(@RequestBody NotificationFilterDto filterDto) {
        List<NotificationSummaryDto> result = notificationService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<NotificationSummaryDto>>builder().success(true).message("Notification filter completed").data(result).build());
    }

}