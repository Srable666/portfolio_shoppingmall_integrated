<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원가입(임시)</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <form id="signupForm" action="/signup" method="post">
        <input type="email" id="email" name="email" required>
        <input type="password" id="password" name="password" required>
        <input type="text" id="name" name="name" required>
        <input type="text" id="address" name="address" required>
        <input type="text" id="phone" name="phone" required>
        
        <!-- 기존 submit 버튼 -->
        <button type="submit">가입하기</button>
    </form>
    
    <!-- 암호화 라이브러리 추가 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
    <script>
    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();  // 폼 제출 일시 중지
        
        // 원본 비밀번호 가져오기
        const passwordInput = document.getElementById('password');
        const originalPassword = passwordInput.value;
        
        // 비밀번호 해싱
        const hashedPassword = CryptoJS.SHA256(originalPassword).toString();
        
        // 해싱된 비밀번호로 교체
        passwordInput.value = hashedPassword;
        
        // 폼 제출
        this.submit();
    });
    </script>
</body>
</html>

