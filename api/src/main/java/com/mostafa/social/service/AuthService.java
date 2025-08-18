package com.mostafa.social.service;


import com.mostafa.social.config.JwtHelper;
import com.mostafa.social.dto.auth.LoginRequestDTO;
import com.mostafa.social.dto.auth.RegisterRequestDTO;
import com.mostafa.social.global.CustomResponseException;
import com.mostafa.social.model.User;
import com.mostafa.social.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtHelper jwtHelper;


    //    Register
    public void register(RegisterRequestDTO dto) {
        User userAccount = new User();

        userAccount.setUsername(dto.username());
        userAccount.setEmail(dto.email());
        userAccount.setFullName(dto.fullName());
        userAccount.setPassword(passwordEncoder.encode(dto.password()));

        userRepo.save(userAccount);
    }

    //    Login
    public Map<String, Object> login(LoginRequestDTO dto) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.email(), dto.password()));

        User user = userRepo.findByEmail(dto.email())
                .orElseThrow(CustomResponseException::BadCredentials);

        Map<String, Object> customClaims = new HashMap<>();
        customClaims.put("userId", user.getId());

        String token = jwtHelper.generateToken(customClaims, user);

        // Prepare response with token and user info
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());

        return response;
    }

}
