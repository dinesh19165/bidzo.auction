package com.bidzo.service;

import com.bidzo.dto.location.*;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public interface LocationService {

    LocationResponseDto create(LocationCreateDto createDto);
    LocationResponseDto update(LocationUpdateDto updateDto);
    void delete(Long id);
    LocationDetailsDto getById(Long id);
    List<LocationSummaryDto> getAll();
    List<LocationSummaryDto> search(LocationSearchDto searchDto);
    List<LocationSummaryDto> filter(LocationFilterDto filterDto);
}
