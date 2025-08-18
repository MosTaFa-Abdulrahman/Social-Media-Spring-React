package com.mostafa.social.dto.user;

public record UpdateUserDTO(
        String fullName,
        String imgUrl,
        String coverImgUrl,
        String city
) {
}
