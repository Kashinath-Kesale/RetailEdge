import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { FiSearch, FiFilter, FiEye, FiMail, FiFileText, FiX } from "react-icons/fi";
import Receipt from '../components/Receipt';
import ReactDOM from 'react-dom/client';
import axiosInstance from '../api/axiosInstance';

const Receipts = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await axiosInstance.get("/sales");
      if (Array.isArray(response.data)) {
        setSales(response.data);
      } else if (response.data && Array.isArray(response.data.sales)) {
        setSales(response.data.sales);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Failed to load sales history");
    }
  };

  const handlePrint = (sale) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups for printing receipts");
      return;
    }

    // Create a container for the receipt
    const receiptContainer = document.createElement('div');
    const root = ReactDOM.createRoot(receiptContainer);
    
    // Render the receipt
    root.render(<Receipt sale={sale} />);

    // Wait for the receipt to render
    setTimeout(() => {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${sale._id}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
              }
              @media print {
                body {
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
              .receipt-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
              }
              .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #3B82F6;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
              }
              .print-button:hover {
                background: #2563EB;
              }
              /* Receipt specific styles */
              .receipt {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .receipt-header {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #000;
              }
              .receipt-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .receipt-subtitle {
                font-size: 16px;
                color: #666;
              }
              .receipt-info {
                margin-bottom: 20px;
              }
              .receipt-info p {
                margin: 5px 0;
                font-size: 14px;
              }
              .receipt-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              .receipt-table th,
              .receipt-table td {
                padding: 8px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              .receipt-table th {
                background-color: #f8f9fa;
                font-weight: bold;
              }
              .receipt-total {
                text-align: right;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 2px solid #000;
              }
              .receipt-total p {
                margin: 5px 0;
                font-size: 16px;
              }
              .receipt-total .grand-total {
                font-size: 20px;
                font-weight: bold;
              }
              .receipt-footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
              }
              @media print {
                .receipt {
                  padding: 0;
                }
                .receipt-container {
                  border: none;
                }
                .receipt-table th {
                  background-color: #f8f9fa !important;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <button onclick="window.print()" class="print-button no-print">
              Print Receipt
            </button>
            <div class="receipt-container">
              ${receiptContainer.innerHTML}
            </div>
            <script>
              // Auto print after a short delay
              setTimeout(() => {
                window.print();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }, 100);
  };

  const handleEmailReceipt = async (sale) => {
    if (!sale.customerEmail) {
      toast.error("No email address available for this customer");
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(`/sales/${sale._id}/email-receipt`);
      if (response.data.success) {
        toast.success("Receipt has been sent to customer's email");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email receipt");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (sale) => {
    setSelectedReceipt(sale);
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      (sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       sale.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       sale._id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filter === "all" ? true :
      filter === "today" ? moment(sale.createdAt).isSame(moment(), 'day') :
      filter === "week" ? moment(sale.createdAt).isSame(moment(), 'week') :
      filter === "month" ? moment(sale.createdAt).isSame(moment(), 'month') :
      true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sales Receipts</h2>
        
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer name or email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              />
            </div>
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Receipts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSales.map((sale) => (
            <div 
              key={sale._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {sale.customerName || "Walk-in Customer"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {moment(sale.createdAt).format("DD MMM YYYY, hh:mm A")}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                    {sale.paymentMethod}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Receipt ID</span>
                    <span className="font-medium text-gray-700">
                      {sale._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Items</span>
                    <span className="font-medium text-gray-700">
                      {sale.products.length} items
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-medium text-gray-700">
                      ₹{Number(sale.totalAmount || sale.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewReceipt(sale)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FiEye /> View
                  </button>
                  <button
                    onClick={() => handlePrint(sale)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiFileText /> Print
                  </button>
                  {sale.customerEmail && (
                    <button
                      onClick={() => handleEmailReceipt(sale)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiMail /> Email
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No receipts found</p>
          </div>
        )}

        {/* Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Receipt Details</h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <Receipt sale={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receipts;