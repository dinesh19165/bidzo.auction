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
import com.bidzo.service.UserService;
import com.bidzo.response.ApiResponse;
import com.bidzo.dto.user.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<UserResponseDto>> create(@RequestBody UserCreateDto createDto) {
        UserResponseDto result = userService.create(createDto);
        return ResponseEntity.ok(ApiResponse.<UserResponseDto>builder().success(true).message("User created").data(result).build());
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserResponseDto>> update(@RequestBody UserUpdateDto updateDto) {
        UserResponseDto result = userService.update(updateDto);
        return ResponseEntity.ok(ApiResponse.<UserResponseDto>builder().success(true).message("User updated").data(result).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().success(true).message("Operation completed successfully").data(null).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailsDto>> getById(@PathVariable Long id) {
        UserDetailsDto result = userService.getById(id);
        return ResponseEntity.ok(ApiResponse.<UserDetailsDto>builder().success(true).message("User details retrieved").data(result).build());
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> getAll() {
        List<UserSummaryDto> result = userService.getAll();
        return ResponseEntity.ok(ApiResponse.<List<UserSummaryDto>>builder().success(true).message("User list retrieved").data(result).build());
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> search(@RequestBody UserSearchDto searchDto) {
        List<UserSummaryDto> result = userService.search(searchDto);
        return ResponseEntity.ok(ApiResponse.<List<UserSummaryDto>>builder().success(true).message("User search completed").data(result).build());
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse<List<UserSummaryDto>>> filter(@RequestBody UserFilterDto filterDto) {
        List<UserSummaryDto> result = userService.filter(filterDto);
        return ResponseEntity.ok(ApiResponse.<List<UserSummaryDto>>builder().success(true).message("User filter completed").data(result).build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserDetailsDto>> findByEmail(@PathVariable String email) {
        UserDetailsDto result = userService.findByEmail(email);
        return ResponseEntity.ok(ApiResponse.<UserDetailsDto>builder().success(true).message("User fetched by email").data(result).build());
    }

}