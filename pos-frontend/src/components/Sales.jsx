import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Sales = () => {
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cart, setCart] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setCustomerEmail(email);
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      const saleData = {
        products: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          priceAtSale: item.price
        })),
        totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentMethod,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined
      };

      const response = await axios.post('/api/sales', saleData);
      
      if (response.data.sale) {
        setShowReceipt(true);
        setCurrentSale(response.data.sale);
        setCart([]);
        setCustomerName("");
        setCustomerEmail("");
        setPaymentMethod("");
        toast.success("Sale completed successfully!");
      }
    } catch (error) {
      console.error('Sale error:', error);
      toast.error(error.response?.data?.message || "Error processing sale");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... existing JSX ... */}
      
      {/* Customer Name input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customer Name (Optional)
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Customer Email input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customer Email (Optional)
        </label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Enter customer email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* ... rest of the JSX ... */}
    </div>
  );
};

export default Sales; 