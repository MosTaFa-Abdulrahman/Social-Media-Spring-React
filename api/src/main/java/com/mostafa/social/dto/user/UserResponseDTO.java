package com.mostafa.social.dto.user;

public record UserResponseDTO(
        Integer id,
        String username,
        String email,
        String fullName,
        String imgUrl,
        String coverImgUrl,
        String city,
        Boolean isFollowing

) {
}
