package com.grocery.payment.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.razorpay.Utils;

@Component
public class SignatureVerifier {

    private static final Logger logger = LoggerFactory.getLogger(SignatureVerifier.class);

    @Value("${razorpay.key.secret}")
    private String razorpaySecret;

    public boolean verifySignature(
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature) throws Exception {

        String payload =
                razorpayOrderId + "|" + razorpayPaymentId;

        try {
            boolean isValid = Utils.verifySignature(
                    payload,
                    razorpaySignature,
                    razorpaySecret);

            if (!isValid) {
                logger.warn("Signature verification failed for Razorpay Order ID: {}", razorpayOrderId);
            }

            return isValid;
        } catch (Exception e) {
            // Fail closed: any error during verification means we cannot
            // confirm the payment is genuine, so treat it as invalid.
            logger.error("Signature verification threw an exception for Razorpay Order ID: {}. Treating as invalid.",
                    razorpayOrderId, e);
            return false;
        }
    }
}