package com.visualizer.automata.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoDB configuration class.
 * Enables Mongo repository scanning and auditing for created/updated timestamps.
 */
@Configuration
@EnableMongoRepositories(basePackages = "com.visualizer.automata.repository")
@EnableMongoAuditing
public class MongoConfig {
}
