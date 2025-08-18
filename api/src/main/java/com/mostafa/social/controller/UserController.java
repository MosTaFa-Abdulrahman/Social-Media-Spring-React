package com.mostafa.social.controller;


import com.mostafa.social.dto.PaginatedResponse;
import com.mostafa.social.dto.user.UpdateUserDTO;
import com.mostafa.social.dto.user.UserResponseDTO;
import com.mostafa.social.global.GlobalResponse;
import com.mostafa.social.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;


    //    Update
    @PutMapping("/{userId}")
    public ResponseEntity<GlobalResponse<UserResponseDTO>> updateUser(
            @PathVariable Integer userId, @Valid @RequestBody UpdateUserDTO dto) {
        UserResponseDTO updatedUser = userService.updateUser(userId, dto);
        GlobalResponse<UserResponseDTO> res = new GlobalResponse<>(updatedUser);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    //    Delete
    @DeleteMapping("/{userId}")
    public ResponseEntity<GlobalResponse<String>> deleteUser(@PathVariable Integer userId) {
        String deleteUser = userService.deleteByUserId(userId);
        GlobalResponse<String> res = new GlobalResponse<>(deleteUser);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    //    Get All
    @GetMapping
    public ResponseEntity<GlobalResponse<PaginatedResponse<UserResponseDTO>>> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest req) {
        Page<UserResponseDTO> users = userService.getAllUsers(page - 1, size);

        String baseUrl = req.getRequestURL().toString();
        String nextUrl = users.hasNext() ? String.format("%s?page=%d&size=%d", baseUrl, page + 1, size) : null;
        String prevUrl = users.hasPrevious() ? String.format("%s?page=%d&size=%d", baseUrl, page - 1, size) : null;

        var paginatedResponse = new PaginatedResponse<UserResponseDTO>(
                users.getContent(),
                users.getNumber() + 1,
                users.getTotalPages(),
                users.getTotalElements(),
                users.hasNext(),
                users.hasPrevious(),
                nextUrl,
                prevUrl
        );

        return new ResponseEntity<>(new GlobalResponse<>(paginatedResponse), HttpStatus.OK);
    }

    //    Get Single
    @GetMapping("/{userId}")
    public ResponseEntity<GlobalResponse<UserResponseDTO>> getByUserId(@PathVariable Integer userId) {
        UserResponseDTO user = userService.getByUserId(userId);
        GlobalResponse<UserResponseDTO> res = new GlobalResponse<>(user);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }


    // Get Suggested Users
    @GetMapping("/suggested")
    public ResponseEntity<GlobalResponse<PaginatedResponse<UserResponseDTO>>> getSuggestedUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest req) {

        Page<UserResponseDTO> suggestedUsers = userService.getSuggestedUsers(page - 1, size);

        String baseUrl = req.getRequestURL().toString();
        String nextUrl = suggestedUsers.hasNext() ? String.format("%s?page=%d&size=%d", baseUrl, page + 1, size) : null;
        String prevUrl = suggestedUsers.hasPrevious() ? String.format("%s?page=%d&size=%d", baseUrl, page - 1, size) : null;

        var paginatedResponse = new PaginatedResponse<UserResponseDTO>(
                suggestedUsers.getContent(),
                suggestedUsers.getNumber() + 1,
                suggestedUsers.getTotalPages(),
                suggestedUsers.getTotalElements(),
                suggestedUsers.hasNext(),
                suggestedUsers.hasPrevious(),
                nextUrl,
                prevUrl
        );

        return new ResponseEntity<>(new GlobalResponse<>(paginatedResponse), HttpStatus.OK);
    }

    //    ************************ ((Specifications)) ******************************** //
    // Follow User
    @PostMapping("/follow/{followingId}")
    public ResponseEntity<GlobalResponse<String>> followUser(@PathVariable Integer followingId) {
        String message = userService.followUser(followingId);
        GlobalResponse<String> res = new GlobalResponse<>(message);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // Unfollow User
    @DeleteMapping("/unfollow/{followingId}")
    public ResponseEntity<GlobalResponse<String>> unfollowUser(@PathVariable Integer followingId) {
        String message = userService.unfollowUser(followingId);
        GlobalResponse<String> res = new GlobalResponse<>(message);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // Get Followers Count
    @GetMapping("/{userId}/followers/count")
    public ResponseEntity<GlobalResponse<Long>> getFollowerCount(@PathVariable Integer userId) {
        long count = userService.getFollowerCount(userId);
        GlobalResponse<Long> res = new GlobalResponse<>(count);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // Get Followings Count
    @GetMapping("/{userId}/followings/count")
    public ResponseEntity<GlobalResponse<Long>> getFollowingCount(@PathVariable Integer userId) {
        long count = userService.getFollowingCount(userId);
        GlobalResponse<Long> res = new GlobalResponse<>(count);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // Get All Followers (Paginated)
    @GetMapping("/{userId}/followers")
    public ResponseEntity<GlobalResponse<PaginatedResponse<UserResponseDTO>>> getAllFollowers(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest req) {

        Page<UserResponseDTO> followers = userService.getAllFollowers(userId, page - 1, size);

        String baseUrl = req.getRequestURL().toString();
        String nextUrl = followers.hasNext() ? String.format("%s?page=%d&size=%d", baseUrl, page + 1, size) : null;
        String prevUrl = followers.hasPrevious() ? String.format("%s?page=%d&size=%d", baseUrl, page - 1, size) : null;

        var paginatedResponse = new PaginatedResponse<UserResponseDTO>(
                followers.getContent(),
                followers.getNumber() + 1,
                followers.getTotalPages(),
                followers.getTotalElements(),
                followers.hasNext(),
                followers.hasPrevious(),
                nextUrl,
                prevUrl
        );

        return new ResponseEntity<>(new GlobalResponse<>(paginatedResponse), HttpStatus.OK);
    }

    // Get All Followings (Paginated)
    @GetMapping("/{userId}/followings")
    public ResponseEntity<GlobalResponse<PaginatedResponse<UserResponseDTO>>> getFollowing(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest req) {

        Page<UserResponseDTO> following = userService.getFollowing(userId, page - 1, size);

        String baseUrl = req.getRequestURL().toString();
        String nextUrl = following.hasNext() ? String.format("%s?page=%d&size=%d", baseUrl, page + 1, size) : null;
        String prevUrl = following.hasPrevious() ? String.format("%s?page=%d&size=%d", baseUrl, page - 1, size) : null;

        var paginatedResponse = new PaginatedResponse<UserResponseDTO>(
                following.getContent(),
                following.getNumber() + 1,
                following.getTotalPages(),
                following.getTotalElements(),
                following.hasNext(),
                following.hasPrevious(),
                nextUrl,
                prevUrl
        );

        return new ResponseEntity<>(new GlobalResponse<>(paginatedResponse), HttpStatus.OK);
    }


}