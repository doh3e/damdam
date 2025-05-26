package com.ssafy.damdam.global.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import com.ssafy.damdam.global.util.secret.AESUtil;

@Converter
@RequiredArgsConstructor
public class AESConverter implements AttributeConverter<String, String> {

    private final AESUtil aesUtil;

    @Override
    public String convertToDatabaseColumn(String plainText) {
        try {
            return aesUtil.encrypt(plainText);
        } catch (Exception e) {
            throw new RuntimeException("[백->DB]암호화 실패", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String encryptedText) {
        try {
            return aesUtil.decrypt(encryptedText);
        } catch (Exception e) {
            throw new RuntimeException("[DB->백]복호화 실패", e);
        }
    }
}

