package com.expenseintelligence.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Render's free tier spins the service down after 15 minutes without inbound
 * traffic. This pings the PUBLIC health endpoint every 10 minutes to keep the
 * instance warm — localhost pings never reach Render's router, so they would
 * not reset the idle timer. Runs only under the "prod" profile; disable with
 * env var KEEP_ALIVE_ENABLED=false.
 */
@Configuration @EnableScheduling @Profile("prod")
@ConditionalOnProperty(name = "app.keep-alive.enabled", havingValue = "true", matchIfMissing = true)
public class KeepAliveConfig {
    private static final Logger log = LoggerFactory.getLogger(KeepAliveConfig.class);
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();

    @Value("${app.keep-alive.url:https://expense-backend-z1dp.onrender.com/api/actuator/health}")
    private String healthUrl;

    @Scheduled(initialDelay = 600_000, fixedDelay = 600_000)
    public void selfPing() {
        try {
            HttpResponse<String> res = http.send(HttpRequest.newBuilder()
                    .uri(URI.create(healthUrl))
                    .timeout(Duration.ofMinutes(3))
                    .GET().build(),
                HttpResponse.BodyHandlers.ofString());
            log.info("Keep-alive ping -> HTTP {} {}", res.statusCode(), res.body());
        } catch (Exception e) {
            log.warn("Keep-alive ping failed: {}", e.getMessage());
        }
    }
}
