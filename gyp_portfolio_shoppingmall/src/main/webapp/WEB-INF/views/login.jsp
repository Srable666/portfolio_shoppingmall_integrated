<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인 페이지(임시)</title>
</head>
<body>
    <h1>로그인 페이지</h1>
    <form action="/login" method="post">
        <input type="email" name="email" placeholder="이메일">
        <input type="password" name="password" placeholder="비밀번호">
        <button type="submit">로그인</button>
    </form>
    <script>
    $('form').on('submit', function(e) {
        e.preventDefault();
        
        const email = $('input[name="email"]').val();
        const password = $('input[name="password"]').val();
        
        $.ajax({
            url: '/api/user/login',
            method: 'POST',
            data: {
                email: email,
                password: password
            },
            success: function() {
                window.location.href = '/';
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
                alert('로그인에 실패했습니다.');
            }
        });
    });
    </script>
</body>
</html>


