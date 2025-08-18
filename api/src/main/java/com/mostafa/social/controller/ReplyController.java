package com.mostafa.social.controller;


import com.mostafa.social.dto.PaginatedResponse;
import com.mostafa.social.dto.reply.CreateReplyDTO;
import com.mostafa.social.dto.reply.ReplyResponseDTO;
import com.mostafa.social.global.GlobalResponse;
import com.mostafa.social.service.ReplyService;
import com.mostafa.social.utils.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/replies")
public class ReplyController {
    private final ReplyService replyService;
    private final CurrentUser currentUser;

    //    Create
    @PostMapping
    public ResponseEntity<GlobalResponse<ReplyResponseDTO>> createReply(
            @Valid @RequestBody CreateReplyDTO dto) {
        ReplyResponseDTO createdReply = replyService.createReply(dto);
        GlobalResponse<ReplyResponseDTO> res = new GlobalResponse<>(createdReply);

        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    //    Delete
    @DeleteMapping("/{replyId}")
    public ResponseEntity<GlobalResponse<String>> deleteReply(@PathVariable Integer replyId) {
        String deletedReply = replyService.deleteReply(replyId);
        GlobalResponse<String> res = new GlobalResponse<>(deletedReply);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }


    //    ************************ ((Specifications)) ******************************** //
    // Get All Replies For Specific => Comment (Paginated)
    @GetMapping("/comment/{commentId}")
    public ResponseEntity<GlobalResponse<PaginatedResponse<ReplyResponseDTO>>> getAllReplies(
            @PathVariable Integer commentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest req) {
        Integer currentUserId = currentUser.getCurrentUserId();
        Page<ReplyResponseDTO> replies = replyService.getRepliesByCommentId(commentId, page - 1, size, currentUserId);

        String baseUrl = req.getRequestURL().toString();
        String nextUrl = replies.hasNext() ? String.format("%s?page=%d&size=%d", baseUrl, page + 1, size) : null;
        String prevUrl = replies.hasPrevious() ? String.format("%s?page=%d&size=%d", baseUrl, page - 1, size) : null;

        var paginatedResponse = new PaginatedResponse<ReplyResponseDTO>(
                replies.getContent(),
                replies.getNumber() + 1,
                replies.getTotalPages(),
                replies.getTotalElements(),
                replies.hasNext(),
                replies.hasPrevious(),
                nextUrl,
                prevUrl
        );

        return new ResponseEntity<>(new GlobalResponse<>(paginatedResponse), HttpStatus.OK);
    }

    // Like/disLike Reply
    @PostMapping("/{replyId}/like")
    public ResponseEntity<GlobalResponse<String>> toggleLike(@PathVariable Integer replyId) {
        Integer currentUserId = currentUser.getCurrentUserId();
        if (currentUserId == null) {
            return new ResponseEntity<>(
                    new GlobalResponse<>("User not authenticated"),
                    HttpStatus.UNAUTHORIZED
            );
        }


        String response = replyService.toggleLike(currentUserId, replyId);
        GlobalResponse<String> res = new GlobalResponse<>(response);

        return new ResponseEntity<>(res, HttpStatus.OK);
    }


}
