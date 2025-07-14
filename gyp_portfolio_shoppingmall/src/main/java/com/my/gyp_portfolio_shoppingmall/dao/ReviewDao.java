package com.my.gyp_portfolio_shoppingmall.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.my.gyp_portfolio_shoppingmall.dto.ReviewDto.ReviewDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ReviewDto.ReviewSearchDTO;
import com.my.gyp_portfolio_shoppingmall.vo.Review;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ReviewDao {    

    private final SqlSession s;

    // 리뷰 등록
    public int insertReview(Review review) {
        return s.insert("ReviewMapper.insertReview", review);
    }

    // 리뷰 수정
    public int updateReviewWithOptimisticLock(Review review) {
        return s.update("ReviewMapper.updateReviewWithOptimisticLock", review);
    }

    // 단일 리뷰 조회
    public Review selectReviewById(int reviewId) {
        return s.selectOne("ReviewMapper.selectReviewById", reviewId);
    }

    // 리뷰 리스트 조회(reviewId, productId, userId 택 1)
    public List<ReviewSearchDTO> selectReviewList(ReviewSearchDTO reviewSearchDTO) {
        return s.selectList("ReviewMapper.selectReviewList", reviewSearchDTO);
    }

    // 리뷰 삭제
    public int deleteReview(int reviewId) {
        return s.update("ReviewMapper.deleteReview", reviewId);
    }

    // 리뷰 수 조회
    public int getReviewCount() {
        return s.selectOne("ReviewMapper.getReviewCount");
    }

    // 이미 작성된 리뷰가 있는지 조회
    public int checkExistingReview(ReviewDTO reviewDTO) {
        return s.selectOne("ReviewMapper.checkExistingReview", reviewDTO);
    }

    // 리뷰 조회(회원ID 기준)
    public List<Review> getReviewByUserId(int userId) {
        return s.selectList("ReviewMapper.getReviewByUserId", userId);
    }
}