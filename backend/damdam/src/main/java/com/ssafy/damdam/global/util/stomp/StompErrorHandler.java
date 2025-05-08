package com.ssafy.damdam.global.util.stomp;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.StompSubProtocolErrorHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class StompErrorHandler extends StompSubProtocolErrorHandler {

	@Override
	public Message<byte[]> handleClientMessageProcessingError(Message<byte[]> clientMessage, Throwable ex) {

		log.error("STOMP ERROR: {}", ex.getMessage());

		if ("Session closed.".equals(ex.getMessage())) {
			log.info("Ignoring normal session close event.");
			return null;
		}

		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(clientMessage);
		String errorMessage = "Unexpected error occurred";

		if (ex instanceof MessageDeliveryException && ex.getMessage() != null) {
			errorMessage = ex.getMessage();
		}

		byte[] errorPayload = errorMessage.getBytes();
		headerAccessor.setLeaveMutable(true);
		headerAccessor.setMessage(errorMessage);

		return MessageBuilder.createMessage(errorPayload, headerAccessor.getMessageHeaders());
	}
}
