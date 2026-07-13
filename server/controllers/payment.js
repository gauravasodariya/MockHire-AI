import Payment from "../models/payment.js";
import User from "../models/user.js";
import razorpay from "../services/razorpay.js";
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;
    if(!amount || !amount || !credits){
        return res.status(400).json({ error: "Amount and credits are required" });
    }
    const options={
        amount: amount*100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    }
    const order=await razorpay.orders.create(options);
    const payment = new Payment({
        userId: req.userId,
        planId,
        amount,
        credits,
        razorpayOrderId: order.id,
        status:"created"
    });
    await payment.save();
    res.status(200).json(order);
  }
  catch(error) {
    console.log(error)
    res.status(500).json({ error: `Failed to create order: ${error.message}`});
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
        if(expectedSignature!==razorpay_signature){
            return res.status(400).json({ error: "Invalid payment signature" });
        }
        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

        if(!payment){
            return res.status(404).json({ error: "Payment not found" });
        }
        if(payment.status==="paid"){
            return res.status(400).json({ error: "Payment already processed" });
        }
        payment.status = "paid";
        payment.razorpayPaymentId = razorpay_payment_id;
        await payment.save();

        const updatedUser = await User.findByIdAndUpdate(payment.userId, { $inc: { credits: payment.credits } }, {new:true});

        res.status(200).json({ message: "Payment verified and credits added successfully", user: updatedUser });
  }
  catch(error) {
    res.status(500).json({ error: "Failed to verify payment" });
  }
}