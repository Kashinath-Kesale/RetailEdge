import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";

export default function Receipts() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await axios.get("/receipts");
        setReceipts(res.data.receipts);
      } catch (err) {
        console.error("Receipt fetch error:", err);
      }
    };

    fetchReceipts();
  }, []);

  const handlePdfDownload = async (saleId) => {
    try {
      const response = await axios.get(`/receipts/pdf/${saleId}`, {
        responseType: 'blob' // Important: This tells axios to expect binary data
      });
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Open the PDF in a new window/tab
      window.open(url, '_blank');
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Receipts</h1>
      <div className="bg-white rounded-lg shadow p-4 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Date</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r, idx) => (
              <tr key={idx} className="border-b">
                <td>{r.customerName || "-"}</td>
                <td>₹{r.totalAmount || "-"}</td>
                <td>{r.paymentMethod || "-"}</td>
                <td>
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <button
                    onClick={() => handlePdfDownload(r._id)}
                    className="text-blue-500 underline cursor-pointer"
                  >
                    View PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 