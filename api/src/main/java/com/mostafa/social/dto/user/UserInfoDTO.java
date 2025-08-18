package com.mostafa.social.dto.user;

public record UserInfoDTO(
        Integer id,
        String username,
        String email,
        String imgUrl,
        String fullName,
        String coverImgUrl,
        String city

) {
}
