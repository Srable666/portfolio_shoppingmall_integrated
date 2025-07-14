package com.my.gyp_portfolio_shoppingmall.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import com.my.gyp_portfolio_shoppingmall.dao.OrderDao;
import com.my.gyp_portfolio_shoppingmall.dao.ReviewDao;
import com.my.gyp_portfolio_shoppingmall.dao.UserDao;
import com.my.gyp_portfolio_shoppingmall.dto.ReviewDto.ReviewDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ReviewDto.ReviewSearchDTO;
import com.my.gyp_portfolio_shoppingmall.exception.ReviewException;
import com.my.gyp_portfolio_shoppingmall.exception.UserException;
import com.my.gyp_portfolio_shoppingmall.support.OptimisticLock;
import com.my.gyp_portfolio_shoppingmall.support.UserSupport;
import com.my.gyp_portfolio_shoppingmall.vo.Review;
import com.my.gyp_portfolio_shoppingmall.vo.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewDao reviewDao;
    private final UserDao userDao;
    private final OrderDao orderDao;
    
    @OptimisticLock
    public int updateReviewWithOptimisticLock(Review review) {
        return reviewDao.updateReviewWithOptimisticLock(review);
    }

    // 리뷰 등록(주문 당사자만 가능)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void insertReview(ReviewDTO reviewDTO) {
        // 토큰에서 유저 정보 조회
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userDao.findByEmailForUpdate(email);

        // user 존재 여부 확인
        if (user == null) {
            throw new UserException.UserNotFoundException();
        }

        // 주문 상품 정보 유효성 검증
        int orderProductCheck = orderDao.checkUserOrderedProduct(reviewDTO);
        if (orderProductCheck == 0) {
            throw new ReviewException.InvalidOrderProductException();
        }

        // 이미 작성된 리뷰가 있는지 조회
        ReviewDTO reviewCheckDTO = new ReviewDTO();
        reviewCheckDTO.setOrderProductId(reviewDTO.getOrderProductId());
        reviewCheckDTO.setUserId(user.getUserId());
        int reviewCheck = reviewDao.checkExistingReview(reviewCheckDTO);
        if (reviewCheck > 0) {
            throw new ReviewException.ReviewAlreadyExistsException();
        }

        // 리뷰 등록
        Review review = new Review();
        review.setOrderProductId(reviewDTO.getOrderProductId());
        review.setProductItemId(reviewDTO.getProductItemId());
        review.setUserId(user.getUserId());
        review.setRating(reviewDTO.getRating());
        review.setComment(reviewDTO.getComment());
        reviewDao.insertReview(review);
    }

    // 리뷰 수정(본인 리뷰만 수정 가능)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void updateReview(ReviewDTO reviewDTO) {
        // 토큰에서 유저 정보 조회
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userDao.findByEmailForUpdate(email);

        // 리뷰 존재 여부 확인
        Review Review = reviewDao.selectReviewById(reviewDTO.getReviewId());
        if (Review == null) {
            throw new ReviewException.ReviewNotFoundException();
        }

        // 리뷰 작성자 본인 여부 확인
        if (!Review.getUserId().equals(user.getUserId())) {
            throw new ReviewException.ReviewNotAuthorizedException();
        }

        // 리뷰 수정
        Review.setReviewId(reviewDTO.getReviewId());
        Review.setRating(reviewDTO.getRating());
        Review.setComment(reviewDTO.getComment());
        Review.setVersion(reviewDTO.getVersion());
        updateReviewWithOptimisticLock(Review);
    }

    // 리뷰 리스트 조회(검색 조건 포함, 페이징 처리)
    public List<ReviewSearchDTO> getReviewList(ReviewSearchDTO reviewSearchDTO) {    
        return reviewDao.selectReviewList(reviewSearchDTO);
    }

    // 리뷰 삭제
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void deleteReview(int reviewId) {
        // 토큰에서 유저 정보 조회
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User userCheck = userDao.findByEmailForUpdate(userEmail);

        // 유저 존재 여부 확인
        if (userCheck == null) {
            throw new UserException.UserNotFoundException();
        }

        // 리뷰 존재 여부 확인
        Review Review = reviewDao.selectReviewById(reviewId);
        if (Review == null) {
            throw new ReviewException.ReviewNotFoundException();
        }
        
        // 관리자&리뷰작성자 일치 여부 확인
        UserSupport.validateNonAdminUserAccess(
            auth, 
            userCheck.getUserId(), 
            Review.getUserId()
        );

        // 리뷰 삭제
        reviewDao.deleteReview(reviewId);
    }

    // 리뷰 수 조회
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public int getReviewCount() {
        return reviewDao.getReviewCount();
    }

    // 리뷰 조회(회원ID 기준)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public List<Review> getReviewByUserId() {
        // 토큰에서 유저 정보 조회
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        User userCheck = userDao.findByEmailForUpdate(userEmail);

        // 유저 존재 여부 확인
        if (userCheck == null) {
            throw new UserException.UserNotFoundException();
        }

        return reviewDao.getReviewByUserId(userCheck.getUserId());
    }
}
