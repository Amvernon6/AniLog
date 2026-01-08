package com.example.AniLog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.example.AniLog.Anilist.AniListClient;

@SpringBootApplication
public class AniLogApplication {

	public static void main(String[] args) {
		SpringApplication.run(AniLogApplication.class, args);
	}

	@Bean
	public AniListClient aniListClient() {
		return new AniListClient("https://graphql.anilist.co");
	}

}
