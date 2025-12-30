package com.example.AniLog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AniLogApplication {

	public static void main(String[] args) {
		SpringApplication.run(AniLogApplication.class, args);
	}

	@Bean
	public aniListClient aniListClient() {
		return new aniListClient("https://graphql.anilist.co");
	}

}
