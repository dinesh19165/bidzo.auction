package com.bidzo.security.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Skeleton for user details service. No database or lookup logic implemented.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Placeholder: real implementation should lookup user and return CustomUserDetails
        throw new UsernameNotFoundException("User lookup not implemented");
    }
}
