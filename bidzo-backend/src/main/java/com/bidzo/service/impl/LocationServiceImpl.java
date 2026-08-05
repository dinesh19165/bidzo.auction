package com.bidzo.service.impl;

import com.bidzo.dto.location.*;
import com.bidzo.repository.AreaRepository;
import com.bidzo.repository.CityRepository;
import com.bidzo.service.LocationService;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class LocationServiceImpl implements LocationService {

    private final CityRepository cityRepository;
    private final AreaRepository areaRepository;

    public LocationServiceImpl(CityRepository cityRepository, AreaRepository areaRepository) {
        this.cityRepository = cityRepository;
        this.areaRepository = areaRepository;
    }

    @Override
    public LocationResponseDto create(LocationCreateDto createDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public LocationResponseDto update(LocationUpdateDto updateDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public void delete(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public LocationDetailsDto getById(Long id) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<LocationSummaryDto> getAll() {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<LocationSummaryDto> search(LocationSearchDto searchDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

    @Override
    public List<LocationSummaryDto> filter(LocationFilterDto filterDto) {
        throw new UnsupportedOperationException("Implementation will be added later.");
    }

}
