package com.grocery.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignDeliveryPartnerRequest {

    @NotNull(message = "Delivery partner id is required")
    private Long deliveryPartnerId;
}
