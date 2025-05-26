package com.ssafy.damdam.global.util.stomp;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import com.ssafy.damdam.global.util.jwt.JwtUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class StompHandler implements ChannelInterceptor {

	private final JwtUtil jwtUtil;

	@Override
	public Message<?> preSend(Message<?> message, MessageChannel channel) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

		if (StompCommand.DISCONNECT == accessor.getCommand()) {
			log.info("STOMP 정상 종료 요청: {}", accessor.getSessionId());
			return message;
		}

		if (StompCommand.CONNECT == accessor.getCommand() || StompCommand.SEND == accessor.getCommand()) {

			String authHeader = accessor.getFirstNativeHeader("Authorization");
			log.info("Stomp authHeader: {}", authHeader);

			if (jwtUtil.isNotValidAuthorization(authHeader)) {
				throw new MessageDeliveryException("Token is missing or invalid");

			}

			String token = authHeader.replace("Bearer ", "");
			if (jwtUtil.isExpired(token)) {
				throw new MessageDeliveryException("Token is expired");
			}

			Long userId = jwtUtil.getUserId(token);

			accessor.setUser(new StompPrincipal(userId.toString()));
			log.info("Principal set in StompHandler -> {}", accessor.getUser().getName());
		}
		return MessageBuilder
			.withPayload(message.getPayload())
			.copyHeaders(accessor.getMessageHeaders())
			.build();
	}
}
