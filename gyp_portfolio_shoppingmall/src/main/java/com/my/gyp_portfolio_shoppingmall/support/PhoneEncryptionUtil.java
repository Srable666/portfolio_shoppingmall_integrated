package com.my.gyp_portfolio_shoppingmall.support;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class PhoneEncryptionUtil {
    
    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
    private static final int KEY_LENGTH = 256;
    private static final int PBKDF2_ITERATIONS = 10000;
    
    @Value("${encryption.phone.secret-key}")
    private String secretKey;

    @Value("${encryption.phone.salt}")
    private String baseSalt;
    
    // PBKDF2WithHmacSHA256 알고리즘을 사용하여 AES 키 생성
    private SecretKeySpec generateKey() throws Exception {
        KeySpec spec = new PBEKeySpec(
            secretKey.toCharArray(), 
            baseSalt.getBytes(StandardCharsets.UTF_8), 
            PBKDF2_ITERATIONS, 
            KEY_LENGTH
        );
        
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        
        return new SecretKeySpec(keyBytes, ALGORITHM);
    }
    
    // 전화번호 암호화
    public String encrypt(String plainText) {
        if (plainText == null || plainText.trim().isEmpty()) {
            return plainText;
        }
        
        try {
            // 키 생성
            SecretKeySpec key = generateKey();
            
            // Cipher 초기화
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            
            // IV 생성
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);
            
            // 암호화 수행
            byte[] encryptedData = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            
            // IV + 암호화된 데이터를 합쳐서 Base64 인코딩
            byte[] encryptedWithIv = new byte[iv.length + encryptedData.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, iv.length);
            System.arraycopy(encryptedData, 0, encryptedWithIv, iv.length, encryptedData.length);
            
            return Base64.getEncoder().encodeToString(encryptedWithIv);
            
        } catch (Exception e) {
            log.error("전화번호 암호화 실패", e);
            throw new RuntimeException("전화번호 암호화 실패", e);
        }
    }
    
    // 전화번호 복호화
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.trim().isEmpty()) {
            return encryptedText;
        }
        
        try {
            // 키 생성
            SecretKeySpec key = generateKey();
            
            // Base64 디코딩
            byte[] decodedData = Base64.getDecoder().decode(encryptedText);
            
            // IV와 암호화된 데이터 분리
            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encryptedData = new byte[decodedData.length - GCM_IV_LENGTH];
            
            System.arraycopy(decodedData, 0, iv, 0, iv.length);
            System.arraycopy(decodedData, iv.length, encryptedData, 0, encryptedData.length);
            
            // Cipher 초기화
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_LENGTH * 8, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, spec);
            
            // 복호화 수행
            byte[] decryptedData = cipher.doFinal(encryptedData);
            
            return new String(decryptedData, StandardCharsets.UTF_8);
            
        } catch (Exception e) {
            log.error("전화번호 복호화 실패", e);
            throw new RuntimeException("전화번호 복호화 실패", e);
        }
    }
}
