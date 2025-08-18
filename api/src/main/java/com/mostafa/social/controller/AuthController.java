package com.mostafa.social.controller;


import com.mostafa.social.dto.auth.LoginRequestDTO;
import com.mostafa.social.dto.auth.LoginResponseDto;
import com.mostafa.social.dto.auth.RegisterRequestDTO;
import com.mostafa.social.dto.user.UserInfoDTO;
import com.mostafa.social.global.GlobalResponse;
import com.mostafa.social.model.User;
import com.mostafa.social.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<GlobalResponse<String>> register(@RequestBody RegisterRequestDTO dto) {
        authService.register(dto);

        return new ResponseEntity<>(new GlobalResponse<>("Registerd Successfully"), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<GlobalResponse<LoginResponseDto>> login(@RequestBody LoginRequestDTO dto) {
        Map<String, Object> loginData = authService.login(dto);

        // Safe casting with proper handling
        LoginResponseDto response = new LoginResponseDto(
                (String) loginData.get("token"),
                (Integer) loginData.get("userId"),
                (String) loginData.get("username"),
                (String) loginData.get("email")
        );

        return new ResponseEntity<>(new GlobalResponse<>(response), HttpStatus.OK);
    }


    @GetMapping("/me")
    public ResponseEntity<GlobalResponse<UserInfoDTO>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        // Get user info from authentication
        User currentUser = (User) authentication.getPrincipal();

        UserInfoDTO userInfo = new UserInfoDTO(
                currentUser.getId(),
                currentUser.getUsername(),
                currentUser.getEmail(),
                currentUser.getImgUrl(),
                currentUser.getFullName(),
                currentUser.getCoverImgUrl(),
                currentUser.getCity()
        );

        return new ResponseEntity<>(new GlobalResponse<>(userInfo), HttpStatus.OK);
    }

    @PostMapping("/logout")
    public ResponseEntity<GlobalResponse<String>> logout() {
        // Clear security context
        SecurityContextHolder.clearContext();
        return new ResponseEntity<>(new GlobalResponse<>("Logged out successfully"), HttpStatus.OK);
    }
}
