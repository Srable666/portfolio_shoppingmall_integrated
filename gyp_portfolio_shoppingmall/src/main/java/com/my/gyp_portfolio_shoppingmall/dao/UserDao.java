package com.my.gyp_portfolio_shoppingmall.dao;

import java.util.List;

import org.apache.ibatis.session.SqlSession;
import org.springframework.stereotype.Repository;

import com.my.gyp_portfolio_shoppingmall.dto.UserDto.UserListDTO;
import com.my.gyp_portfolio_shoppingmall.vo.LoginHistory;
import com.my.gyp_portfolio_shoppingmall.vo.User;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class UserDao {

    private final SqlSession s;

    // 회원 가입
    public int insertUser(User user) {
        return s.insert("UserMapper.insertUser", user);
    }

    // 이메일로 사용자 정보 조회
    public User findByEmailForUpdate(String email) {
        return s.selectOne("UserMapper.findByEmailForUpdate", email);
    }

    // userId로 사용자 정보 조회
    public User findByUserId(Integer userId) {
        return s.selectOne("UserMapper.findByUserId", userId);
    }

    // 사용자 일반 정보 수정
    public int updateUserWithOptimisticLock(User user) {
        return s.update("UserMapper.updateUserWithOptimisticLock", user);
    }

    // 사용자 비밀번호 수정 
    public int updatePassword(User user) {
        return s.update("UserMapper.updatePassword", user);
    }

    // 사용자 탈퇴
    public int deleteUser(String email) {
        return s.update("UserMapper.deleteUser", email);
    }
    
    // 로그인 기록 저장
    public void saveLoginHistory(LoginHistory loginHistory) {
        s.insert("LoginHistoryMapper.insertLoginHistory", loginHistory);
    }

    // 비밀번호 재설정 토큰 업데이트
    public int updateResetToken(User user) {
        return s.update("UserMapper.updateResetToken", user);
    }

    // 비밀번호 재설정 토큰 조회
    public User findByResetToken(String resetToken) {
        return s.selectOne("UserMapper.findByResetToken", resetToken);
    }

    // 회원 수 조회
    public int getUserCount() {
        return s.selectOne("UserMapper.getUserCount");
    }

    // 회원 목록 조회
    public List<User> getUserList(UserListDTO userListDTO) {
        return s.selectList("UserMapper.getUserList", userListDTO);
    }

    // 회원 활성화/비활성화 상태 수정
    public int updateUserDeletedForAdmin(User user) {
        return s.update("UserMapper.updateUserDeletedForAdmin", user);
    }

    // 로그인 기록 조회
    public List<LoginHistory> getLoginHistory(Integer userId) {
        return s.selectList("LoginHistoryMapper.getLoginHistory", userId);
    }
}