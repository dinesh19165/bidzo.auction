package com.bidzo.repository;

import com.bidzo.entity.Address;
import com.bidzo.entity.Area;
import com.bidzo.entity.City;
import com.bidzo.entity.Country;
import com.bidzo.entity.State;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    Optional<Address> findById(Long id);
    List<Address> findAllByArea(Area area);
    Page<Address> findAllByArea(Area area, Pageable pageable);
    long countByArea(Area area);
    List<Address> findAllByCity(City city);
    Page<Address> findAllByCity(City city, Pageable pageable);
    long countByCity(City city);
    List<Address> findAllByState(State state);
    Page<Address> findAllByState(State state, Pageable pageable);
    long countByState(State state);
    List<Address> findAllByCountry(Country country);
    Page<Address> findAllByCountry(Country country, Pageable pageable);
    long countByCountry(Country country);
}