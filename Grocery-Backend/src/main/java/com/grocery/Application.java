package com.grocery;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;


@EnableFeignClients

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
	/*
	 * configure ModelMapper as spring bean
	 * <bean id class ...../>
	 * Add @Bean annotated method to return ModelMapper instance
	 * - to be managed by SC
	 */
	@Bean //method level annotation - to declare a method returning java object
	 ModelMapper modelMapper()
	{
		ModelMapper mapper=new ModelMapper();
		//configure mapper - to transfer the matching props (name + data type)
		mapper.getConfiguration()
		.setMatchingStrategy(MatchingStrategies.STRICT)
		//configure mapper - not to transfer nulls from src -> dest
		.setPropertyCondition(Conditions.isNotNull());
		return mapper;//Method rets configured ModelMapper bean to SC
	}
	
	@Bean
	public org.springframework.boot.CommandLineRunner databaseInitializer(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
		return args -> {
			try {
				System.out.println("Altering orders table status column...");
				jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(50) NOT NULL");
				System.out.println("Orders table status column altered successfully.");
			} catch (Exception e) {
				System.err.println("Failed to alter orders table: " + e.getMessage());
			}
		};
	}

}
