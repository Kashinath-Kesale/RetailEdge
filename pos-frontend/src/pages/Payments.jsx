import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { FiSearch, FiDollarSign, FiCreditCard, FiFilter, FiShoppingCart } from "react-icons/fi";
import moment from "moment";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Fetch sales data instead of payments
      const res = await axiosInstance.get("/sales");
      // Transform sales data into payment format
      const transformedPayments = res.data.map(sale => ({
        _id: sale._id,
        date: sale.createdAt || sale.date,
        customerName: sale.customerName || "Walk-in Customer",
        amount: sale.totalAmount || sale.total,
        method: sale.paymentMethod?.toLowerCase() || "cash",
        status: "completed", // Since these are completed sales
        reference: `SALE-${sale._id.slice(-6).toUpperCase()}`,
        items: sale.products || sale.items,
        transactionId: sale._id
      }));
      setPayments(transformedPayments);
    } catch (err) {
      console.error("Payment fetch error:", err);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filter === "all" ||
      (filter === "completed" && payment.status === "completed") ||
      (filter === "pending" && payment.status === "pending") ||
      (filter === "failed" && payment.status === "failed");

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "cash":
        return <FiDollarSign className="text-green-600" />;
      case "card":
        return <FiCreditCard className="text-blue-600" />;
      case "upi":
        return <FiShoppingCart className="text-purple-600" />;
      default:
        return <FiDollarSign className="text-gray-600" />;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Payment History
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by customer name or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
          </div>

          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white appearance-none"
            >
              <option value="all">All Payments</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {loading ? (
            <div className="p-6 text-center text-gray-500 text-base">
              Loading payment history...
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-base">
              {searchQuery
                ? "No payments found matching your search."
                : "No payment history found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700">
                        {moment(payment.date).format("MMM D, YYYY h:mm A")}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {payment.customerName}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">
                        ₹{(payment.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          <span className="capitalize">{payment.method}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {payment.reference}
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
  );
}
