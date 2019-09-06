package com.example.chat_app_demo;

import javafx.application.Application;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;

import static java.util.Arrays.asList;
import static java.util.concurrent.TimeUnit.SECONDS;

// end points need to be tested against
// ws/app/chat.sendMessage
// ws/app/chat.addUser
// ws/topic
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = Application.class)

public class ChatAppDemoApplicationTests {
	static final String WebSocket_URL = "ws://localhost:8080:/ws";
	static final String WebSocket_Topic = "/topic";
	BlockingQueue<String> blockingQueue;
	WebSocketStompClient stompClient;

	@Before
	public void setup() {
		blockingQueue = new LinkedBlockingDeque<>();
		stompClient = new WebSocketStompClient(
				new SockJsClient(asList(new WebSocketTransport(new StandardWebSocketClient()))));
	}

	@Test
	public void testChat() throws Exception {

		StompSession session = stompClient.connect(WebSocket_URL, new StompSessionHandlerAdapter() {
		}).get(1, SECONDS);
		session.subscribe(WebSocket_Topic, new DefaultStompFrameHandler());

		String message = "Message Test";
		session.send("app/chat.sendMessage", message.getBytes());
		Assert.assertEquals(message, blockingQueue.poll(1, SECONDS));

	}

	class DefaultStompFrameHandler implements StompFrameHandler {
		@Override
		public Type getPayloadType(StompHeaders stompHeaders) {
			return byte[].class;
		}

		@Override
		public void handleFrame(StompHeaders stompHeaders, Object o) {
			blockingQueue.offer(new String((byte[]) o));
		}
	}
}
