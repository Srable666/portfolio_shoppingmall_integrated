package com.my.gyp_portfolio_shoppingmall.support;

import java.math.BigDecimal;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class EmailSender {

    @Value("${app.domain}")
    private String domain;

    @Value("${spring.mail.username}")
    private String mailUsername;

    private final JavaMailSender javaMailSender;

    public EmailSender(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }
    
    // 일반적인 이메일 발송 메서드
    public void sendEmail(String to, String subject, String htmlContent) {
        MimeMessage message = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailUsername);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            javaMailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("메일 전송 실패", e);
        }
    }

    // 비밀번호 재설정 이메일
    public void sendPasswordResetEmail(String email, String resetToken) {
        String subject = "[GYP.Portfolio Mall] 비밀번호 재설정";
        String content = createPasswordResetEmailContent(resetToken);
        sendEmail(email, subject, content);
    }

    // 가입 환영 이메일
    public void sendWelcomeEmail(String email, String userName) {
        String subject = "[GYP.Portfolio Mall] 가입을 환영합니다";
        String content = createWelcomeEmailContent(userName);
        sendEmail(email, subject, content);
    }
    
    // 결제 완료 이메일
    public void sendPaymentCompletedEmail(String email, String userName, String orderNumber, BigDecimal amount) {
        String subject = "[GYP.Portfolio Mall] 결제가 완료되었습니다";
        String content = createPaymentCompletedEmailContent(userName, orderNumber, amount);
        sendEmail(email, subject, content);
    }
    
    // 비밀번호 재설정 이메일 템플릿
    private String createPasswordResetEmailContent(String resetToken) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"ko\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>[GYP.Portfolio Mall] 비밀번호 재설정</title>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <p>안녕하세요, GYP.Portfolio Mall입니다.</p>\n" +
                "    <p>아래 링크를 클릭하여 비밀번호를 재설정해 주세요.</p>\n" +
                "    <p><a href=\"" + domain + "/reset-password?token=" + resetToken + "\">비밀번호 재설정 링크</a></p>\n" +
                "    <p>만약 본인이 비밀번호 재설정을 요청하지 않았다면, 비밀번호를 변경하지 마십시오.</p>\n" +
                "    <p>감사합니다.</p>\n\n" +
                "    <p>*이 이메일은 포트폴리오 쇼핑몰에서 발송되었습니다. 실제 쇼핑몰이 아님에 유의해주세요.</p>\n" +
                "</body>\n" +
                "</html>";
    }

    // 가입 환영 이메일 템플릿
    private String createWelcomeEmailContent(String userName) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"ko\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>[GYP.Portfolio Mall] 가입 환영</title>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <p>안녕하세요, " + userName + "님.</p>\n" +
                "    <p>포트폴리오 쇼핑몰에 가입해 주셔서 감사합니다.</p>\n" +
                "    <p>포트폴리오 쇼핑몰에서 다양한 상품을 확인하고 구매해 보세요.</p>\n" +
                "    <p>감사합니다.</p>\n\n" +
                "    <p>*이 이메일은 포트폴리오 쇼핑몰에서 발송되었습니다. 실제 쇼핑몰이 아님에 유의해주세요.</p>\n" +
                "</body>\n" +
                "</html>";
    }
    
    // 결제 완료 이메일 템플릿
    private String createPaymentCompletedEmailContent(String userName, String orderNumber, BigDecimal amount) {
        return "<!DOCTYPE html>\n" +
                "<html lang=\"ko\">\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "    <title>[GYP.Portfolio Mall] 결제 완료</title>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <p>안녕하세요, " + userName + "님.</p>\n" +
                "    <p>결제가 완료되었습니다.</p>\n" +
                "    <p>주문번호: " + orderNumber + "</p>\n" +
                "    <p>결제금액: " + amount + "원</p>\n" +
                "    <p>감사합니다.</p>\n\n" +
                "    <p>*이 이메일은 포트폴리오 쇼핑몰에서 발송되었습니다. 실제 쇼핑몰이 아님에 유의해주세요.</p>\n" +
                "</body>\n" +
                "</html>";
    }
    
    // public void sendEmail(String email, String resetToken) {
    //     MimeMessage message = javaMailSender.createMimeMessage();
    //     try {
    //         MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
    //         helper.setFrom(mailUsername); // Spring Boot 설정 파일의 username 사용
    //         helper.setTo(email);
    //         helper.setSubject("[GYP.Portfolio Mall] 비밀번호 재설정");

    //         String content =
    //             "<!DOCTYPE html>\n" +
    //             "<html lang=\"ko\">\n" +
    //             "<head>\n" +
    //             "    <meta charset=\"UTF-8\">\n" +
    //             "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
    //             "    <title>비밀번호 재설정</title>\n" +
    //             "</head>\n" +
    //             "<body>\n" +
    //             "    <p>안녕하세요, GYP.Portfolio Mall입니다.</p>\n" +
    //             "    <p>아래 링크를 클릭하여 비밀번호를 재설정해 주세요.</p>\n" +
    //             "    <p><a href=\"" + domain + "/reset-password?token=" + resetToken + "\">비밀번호 재설정 링크</a></p>\n" +
    //             "    <p>만약 본인이 비밀번호 재설정을 요청하지 않았다면, 비밀번호를 변경하지 마십시오.</p>\n" +
    //             "    <p>감사합니다.</p>\n" +
    //             "</body>\n" +
    //             "</html>";

    //         helper.setText(content, true); // HTML 컨텐츠 사용

    //         javaMailSender.send(message);

    //     } catch (MessagingException e) {
    //         throw new RuntimeException("메일 전송 실패", e);
    //     }
    // }
}