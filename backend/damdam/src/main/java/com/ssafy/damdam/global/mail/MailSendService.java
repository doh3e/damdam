package com.ssafy.damdam.global.mail;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.damdam.global.mail.exception.MailException;
import jakarta.activation.DataSource;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.util.ByteArrayDataSource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import static com.ssafy.damdam.global.mail.exception.MailExceptionCode.*;
import static org.springframework.http.HttpStatus.OK;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailSendService {

	private final JavaMailSender mailSender;

	@Value("${HUNTER_IO_SECRET_KEY}")
	private String HUNTER_IO_KEY;

	public void sendEmail(String sendEmail, String subject, String body, String imageUrl) {
		try {
			log.info("Validating email: " + sendEmail);
			if (!isEmailValidWithHunter(sendEmail)) {
				throw new MailException(MAIL_NOT_FOUND);
			}

			log.info("Sending email to " + sendEmail);

			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = null;

			helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(sendEmail);
			helper.setSubject(subject);
			helper.setText(body, true);
			if (imageUrl != null && !imageUrl.isEmpty()) {
				byte[] imageBytes = downloadImageFromUrl(imageUrl);
				DataSource dataSource = new ByteArrayDataSource(imageBytes, "image/png");
				helper.addInline("image", dataSource);
			}

			mailSender.send(message);
		} catch (MessagingException | JsonProcessingException e) {
			e.printStackTrace(); // 스택 트레이스 출력
			throw new MailException(MAIL_NOT_SEND);
		}

	}

	private byte[] downloadImageFromUrl(String imageUrl) {
		try (InputStream in = new URL(imageUrl).openStream()) {
			return in.readAllBytes();
		} catch (IOException e) {
			throw new MailException(IMAGE_NOT_DOWNLOAD);
		}
	}

	private boolean isEmailValidWithHunter(String email) throws JsonProcessingException {
		String url = "https://api.hunter.io/v2/email-verifier?email=" + email + "&api_key=" + HUNTER_IO_KEY;

		RestTemplate restTemplate = new RestTemplate();
		ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

		if (response.getStatusCode() == OK) {
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode jsonNode = objectMapper.readTree(response.getBody());

			// 응답에서 status 값이 "valid"인지 확인
			String status = jsonNode.path("data").path("status").asText();
			log.info("status {}", status);
			return "valid".equals(status);
		}

		return false; // 실패 시 기본적으로 유효하지 않은 것으로 간주
	}
}
