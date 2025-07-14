package com.my.gyp_portfolio_shoppingmall.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.my.gyp_portfolio_shoppingmall.dto.ReviewDto.ReviewDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ReviewDto.ReviewSearchDTO;
import com.my.gyp_portfolio_shoppingmall.exception.OptimisticLockingException;
import com.my.gyp_portfolio_shoppingmall.exception.ReviewException;
import com.my.gyp_portfolio_shoppingmall.exception.UserException;
import com.my.gyp_portfolio_shoppingmall.service.ReviewService;
import com.my.gyp_portfolio_shoppingmall.vo.Review;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/review")
public class ReviewController {
    
    private final ReviewService reviewService;

    // 리뷰 등록(주문 당사자만 가능)
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/insertReview")
    public ResponseEntity<?> insertReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            reviewService.insertReview(reviewDTO);
            return ResponseEntity.ok("리뷰 등록이 완료되었습니다.");
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ReviewException.InvalidOrderProductException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ReviewException.ReviewAlreadyExistsException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("리뷰 등록 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 리뷰 등록에 실패했습니다.");
        }
    }

    // 리뷰 수정(리뷰 작성자만 가능)
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping("/updateReview")
    public ResponseEntity<?> updateReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            reviewService.updateReview(reviewDTO);
            return ResponseEntity.ok("리뷰 수정이 완료되었습니다.");
        } catch (ReviewException.ReviewNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ReviewException.ReviewNotAuthorizedException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("리뷰 수정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 리뷰 수정에 실패했습니다.");
        }
    }

    // 리뷰 리스트 조회(검색 조건 포함, 페이징 처리)
    @GetMapping("/list")
    public ResponseEntity<?> getReviewList(@ModelAttribute ReviewSearchDTO reviewSearchDTO) {
        try {
            List<ReviewSearchDTO> reviewList = reviewService.getReviewList(reviewSearchDTO);
            return ResponseEntity.ok(reviewList);
        } catch (Exception e) {
            log.error("리뷰 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 리뷰 목록 조회에 실패했습니다.");
        }
    }

    // 리뷰 삭제
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN')")
    @PostMapping("/deleteReview")
    public ResponseEntity<?> deleteReview(@RequestBody ReviewDTO reviewDTO) {
        try {
            reviewService.deleteReview(reviewDTO.getReviewId());
            return ResponseEntity.ok("리뷰 삭제가 완료되었습니다.");
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ReviewException.ReviewNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("리뷰 삭제 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 리뷰 삭제에 실패했습니다.");
        }
    }

    // 리뷰 수 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<?> getReviewCount() {
        try {
            int reviewCount = reviewService.getReviewCount();
            return ResponseEntity.ok(reviewCount);
        } catch (Exception e) {
            log.error("리뷰 수 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 리뷰 수 조회에 실패했습니다.");
        }
    }

    // 리뷰 조회(회원ID 기준)
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/listByUserId")
    public ResponseEntity<?> getReviewListByUserId() {
        try {
            List<Review> reviewList = reviewService.getReviewByUserId();
            return ResponseEntity.ok(reviewList);
        } catch (UserException.UserNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("리뷰 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 리뷰 목록 조회에 실패했습니다.");
        }
    }
}