package com.grocery.payment.dto;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;

@Data
public class WebhookEvent {

    private String event;

    private JsonNode payload;

}