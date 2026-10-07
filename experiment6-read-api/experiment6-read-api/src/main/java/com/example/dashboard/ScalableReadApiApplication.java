package com.example.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class ScalableReadApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(ScalableReadApiApplication.class, args);
    }
}
