package com.expenseintelligence.config;
import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class AiConfig {
    @Bean public ChatClient chatClient(OpenAiChatClient client) { return client; }
}
