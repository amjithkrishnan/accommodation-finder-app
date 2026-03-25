package com.example.serviceapp.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Converter
@Component
public class EncryptedFieldConverter implements AttributeConverter<String, String> {

    private static AESEncryptor encryptor;

    // Spring injects the key, then sets it statically so JPA can use it
    @Value("${app.encryption.key}")
    public void setEncryptionKey(String key) {
        EncryptedFieldConverter.encryptor = new AESEncryptor(key);
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (encryptor == null || attribute == null) return attribute;
        return encryptor.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (encryptor == null || dbData == null) return dbData;
        return encryptor.decrypt(dbData);
    }
}
