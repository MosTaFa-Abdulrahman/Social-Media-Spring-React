package com.mostafa.social.dto.auth;


public record LoginResponseDto(
        String token,
        Integer userId,
        String username,
        String email
) {
}
