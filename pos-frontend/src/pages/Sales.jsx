// src/pages/Sales.jsx
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { 
  FiTrash2, 
  FiSearch, 
  FiPlus, 
  FiMinus, 
  FiX, 
  FiShoppingCart, 
  FiUser, 
  FiMail
} from "react-icons/fi";
import Receipt from '../components/Receipt';
import ReactDOM from 'react-dom/client';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState(null);
  const searchRef = useRef(null);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch sales history on mount
  useEffect(() => {
    fetchSales();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get("/products");
      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
        toast.error("Invalid products data format received");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      toast.error("Failed to load products");
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axiosInstance.get("/sales");
      if (Array.isArray(res.data)) {
        setRecentSales(res.data.slice(0, 5)); // Get last 5 sales
      } else if (res.data && Array.isArray(res.data.sales)) {
        setRecentSales(res.data.sales.slice(0, 5));
      } else {
        setRecentSales([]);
        toast.error("Invalid sales data format received");
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
      setRecentSales([]);
      toast.error("Failed to load sales history");
    }
  };

  // Calculate total whenever cart changes
  useEffect(() => {
    const newTotal = cart.reduce((sum, item) => sum + (item.priceAtSale * item.quantity), 0);
    setTotal(newTotal);
  }, [cart]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    const existingItem = cart.find(item => item.productId === selectedProduct._id);

    if (existingItem) {
      if (existingItem.quantity >= selectedProduct.stock) {
        toast.warning('Maximum stock limit reached');
        return;
      }
      setCart(cart.map(item =>
        item.productId === selectedProduct._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      if (selectedProduct.stock <= 0) {
        toast.warning('Product out of stock');
        return;
      }
      setCart([...cart, {
        productId: selectedProduct._id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: quantity,
        priceAtSale: selectedProduct.price
      }]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const product = products.find(p => p._id === productId);
    if (newQuantity > product.stock) {
      toast.warning('Maximum stock limit reached');
      return;
    }
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const saleData = {
        products: cart.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          priceAtSale: item.priceAtSale,
        })),
        totalAmount: total,
        paymentMethod,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
      };

      const response = await axiosInstance.post("/sales", saleData);

      if (response.data.success) {
        toast.success("Sale completed successfully");
        
        // Reset form
        setCart([]);
        setPaymentMethod("Cash");
        setCustomerName("");
        setCustomerEmail("");
        setSelectedProduct(null);
        setSearchTerm("");
        setQuantity(1);

        // Refresh sales list
        await fetchSales();

        // Show receipt
        setCurrentSale(response.data.sale);
        setShowReceipt(true);
      }
    } catch (err) {
      console.error("Error creating sale:", err);
      const errorMessage = err.response?.data?.message || "Sale failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (sale) => {
    const receiptRoot = ReactDOM.createRoot(document.getElementById('receipt-root'));
    receiptRoot.render(
      <Receipt
        sale={sale}
        onClose={() => {
          receiptRoot.unmount();
        }}
      />
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-xl xs:text-2xl font-bold text-gray-800">Record New Sale</h2>
        <p className="text-xs xs:text-sm text-gray-600 mt-1">Create and manage your sales transactions</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Product Search and Selection */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Add Products</h3>
              <div className="mt-4 relative" ref={searchRef}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Type to search products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full p-2.5 pl-11 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 placeholder-gray-400 text-sm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiSearch size={18} />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setIsDropdownOpen(true);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FiX size={18} />
                    </button>
                  )}
                </div>
                
                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductSelect(product)}
                          className="p-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-800 text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600 text-sm">₹{product.price}</p>
                              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500 text-sm">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedProduct && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 rounded-lg hover:bg-gray-200"
                    >
                      <FiMinus />
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 rounded-lg hover:bg-gray-200"
                    >
                      <FiPlus />
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Cart and Checkout */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="p-4">
              <h3 className="text-base xs:text-lg font-bold mb-3 xs:mb-4 text-gray-800 flex items-center gap-2">
                <FiShoppingCart className="text-[var(--retailedge-primary)]" />
                Cart
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No items in cart
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.priceAtSale} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="p-1 rounded-lg hover:bg-gray-200"
                          >
                            <FiMinus />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className="p-1 rounded-lg hover:bg-gray-200"
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.productId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Total and Customer Details */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm xs:text-base text-gray-600">Total Amount:</span>
                      <span className="text-lg xs:text-xl font-bold text-green-600">₹{total.toFixed(2)}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Card">Card</option>
                          <option value="UPI">UPI</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter customer name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                          Customer Email
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter customer email"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleSubmit}
                        disabled={loading || cart.length === 0}
                        className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Processing..." : "Complete Sale"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="p-4">
            <h3 className="text-base xs:text-lg font-bold mb-3 xs:mb-4 text-gray-800 flex items-center gap-2">
              <FiShoppingCart className="text-[var(--retailedge-primary)]" />
              Recent Sales
            </h3>

            {recentSales.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No recent sales found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentSales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {moment(sale.createdAt || sale.date).format("MMM D, YYYY h:mm A")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {sale.customerName || "Walk-in Customer"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {sale.products?.length || sale.items?.length || 0} items
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">
                          ₹{(sale.totalAmount || sale.total || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span className="capitalize">{sale.paymentMethod}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handlePrint(sale)}
                            className="text-green-600 hover:text-green-700"
                          >
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && currentSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold">Sale Receipt</h3>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            <div className="p-4">
              <Receipt sale={currentSale} onClose={() => setShowReceipt(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Receipt Root */}
      <div id="receipt-root"></div>
    </div>
  );
};

export default Sales;
