package com.grocery.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryDashboardResponse {

    private long todaysAssignedOrders;

    private long pendingDeliveries;

    private long completedToday;

    private long cancelledOrders;
}
