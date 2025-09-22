import Razorpay from "razorpay";
import crypto from "crypto";

// @desc    Create a payment order
// @route   POST /api/payments/create-order
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    console.log('Creating order for amount:', amount);

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    // Check if environment variables are set
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials not found in environment variables");
      return res.status(500).json({
        success: false,
        message: "Payment service configuration error",
      });
    }

    // Initialize Razorpay instance
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: parseInt(amount), // Ensure amount is integer (in paisa)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    console.log("Creating order with options:", options);

    const order = await instance.orders.create(options);
    
    console.log("Order created successfully:", order);

    // Return the order data in the expected format
    res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    });

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    
    // Handle specific Razorpay errors
    if (error.error && error.error.code) {
      return res.status(400).json({
        success: false,
        message: `Razorpay Error: ${error.error.description}`,
        code: error.error.code,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Public
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay key secret not found");
      return res.status(500).json({
        success: false,
        message: "Payment verification configuration error",
      });
    }

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature - payment verification failed",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      },
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};