import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext"; // Update this path as needed
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCreditCard, FiCheckCircle } from "react-icons/fi";
import Squares from "./Squares"; // Make sure this path is correct

const Payment = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  
  // Calculate total price
  const totalPrice = cart
    .reduce((total, item) => total + item.price, 0)
    .toFixed(2);

  // Generate a random order number
  const orderNumber = `ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle payment processing
  const handlePayment = () => {
    setIsProcessing(true);

    try {
      const razorpayKey = "rzp_test_placeholder"; // Replace with your actual key in production
      
      const options = {
        key: razorpayKey,
        amount: parseFloat(totalPrice) * 100, // Amount in smallest currency unit (paise for INR)
        currency: "INR",
        name: "Your Restaurant Name",
        description: `Payment for order ${orderNumber}`,
        image: "https://your-logo-url.com/logo.png", // Replace with your logo URL
        handler: function(response) {
          // Handle successful payment
          setPaymentId(response.razorpay_payment_id);
          setIsProcessing(false);
          setIsComplete(true);
          
          // Store paymentId in session/local storage to access it in the invoice
          sessionStorage.setItem('paymentId', response.razorpay_payment_id);
          
          // Wait 2 seconds before redirecting to invoice
          setTimeout(() => {
            navigate('/invoice');
          }, 2000);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9876543210"
        },
        notes: {
          address: "Customer Address"
        },
        theme: {
          color: "#333333" // Dark theme color to match
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
    }
  };

  // Mock payment process for demo purposes
  const handleMockPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const mockPaymentId = "pay_" + Math.random().toString(36).substring(2, 15);
      setPaymentId(mockPaymentId);
      setIsProcessing(false);
      setIsComplete(true);
      
      // Store paymentId in session/local storage
      sessionStorage.setItem('paymentId', mockPaymentId);
      
      // Wait 2 seconds before redirecting to invoice
      setTimeout(() => {
        navigate('/invoice');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      {/* Squares background */}
      <div className="absolute inset-0 z-0">
        <Squares
          direction="none"
          speed={0}
          borderColor="#333"
          squareSize={50}
          hoverFillColor="#444"
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 min-h-screen p-4 md:p-8 bg-transparent"
      >
        <div className="max-w-3xl mx-auto py-30">
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/cart"
              className="text-gray-300 hover:text-gray-100 font-medium flex items-center"
            >
              <FiArrowLeft className="mr-2" /> Back to Cart
            </Link>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-100">
              Payment
            </h2>
          </div>

          {cart.length === 0 ? (
            <div className="bg-black bg-opacity-80 rounded-lg shadow-md p-8 text-center border border-gray-800">
              <p className="text-gray-400 text-lg mb-6">No items to pay for</p>
              <Link
                to="/menu"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 text-white font-medium hover:from-gray-700 hover:to-gray-600 transition-all duration-300"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-black bg-opacity-80 rounded-lg shadow-md p-6 mb-6 border border-gray-800">
                <h3 className="text-xl font-bold text-gray-100 mb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-800">
                    <span className="text-gray-400">Order Number</span>
                    <span className="font-medium text-gray-200">{orderNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Items ({cart.length})</span>
                    <span className="font-medium text-gray-200">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Delivery Fee</span>
                    <span className="font-medium text-gray-200">₹0.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tax</span>
                    <span className="font-medium text-gray-200">₹0.00</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-300">
                      Total
                    </span>
                    <span className="text-lg font-bold text-white">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-black bg-opacity-80 rounded-lg shadow-md p-6 mb-6 border border-gray-800">
                <h3 className="text-xl font-bold text-gray-100 mb-4">Payment Method</h3>
                
                {isComplete ? (
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-4">
                      <FiCheckCircle className="text-green-500" size={60} />
                    </div>
                    <h4 className="text-xl font-bold text-green-500 mb-2">Payment Successful!</h4>
                    <p className="text-gray-400 mb-2">Payment ID: {paymentId}</p>
                    <p className="text-gray-400">Redirecting to invoice...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-500 transition-all duration-300 flex justify-center items-center"
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <FiCreditCard className="mr-2" />
                          Pay with Razorpay
                        </span>
                      )}
                    </button>
                    
                    <button
                      onClick={handleMockPayment}
                      disabled={isProcessing}
                      className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-700 text-white font-medium hover:from-gray-700 hover:to-gray-600 transition-all duration-300 flex justify-center items-center"
                    >
                      {isProcessing ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Demo Payment (Skip)
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;