import React from 'react';
import { FiShoppingBag, FiPrinter } from 'react-icons/fi';
import moment from 'moment';

const Receipt = ({ sale, onClose }) => {
  const formatDate = (date) => {
    return moment(date).format('DD MMM YYYY, hh:mm A');
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return `₹${Number(amount).toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!sale) {
    return (
      <div className="min-w-[300px] max-w-[600px] mx-auto bg-white p-8 rounded-lg shadow-xl">
        <p className="text-center text-gray-500">No sale data available</p>
      </div>
    );
  }

  return (
    <div className="min-w-[300px] max-w-[600px] mx-auto bg-white p-8 rounded-lg shadow-xl">
      {/* Print Button */}
      <div className="print:hidden flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <FiPrinter />
          Print Receipt
        </button>
      </div>

      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <div className="flex items-center justify-center mb-3">
          <FiShoppingBag className="text-[var(--retailedge-primary)] text-4xl mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">RetailEdge</h1>
        </div>
        <p className="text-gray-800 text-lg font-medium">Your Trusted Retail Partner</p>
        <p className="text-gray-700 mt-2">123 Business Street, Pune, Maharashtra</p>
        <p className="text-gray-700">Phone: +91 1234567890</p>
      </div>

      {/* Sale Details */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-3 text-gray-800">
          <div className="font-medium">Receipt No:</div>
          <div className="text-right">{sale._id?.slice(-6).toUpperCase() || 'N/A'}</div>
          
          <div className="font-medium">Date:</div>
          <div className="text-right">{formatDate(sale.createdAt || sale.date || new Date())}</div>
          
          <div className="font-medium">Customer:</div>
          <div className="text-right">{sale.customerName || 'Walk-in Customer'}</div>

          {sale.customerEmail && (
            <>
              <div className="font-medium">Email:</div>
              <div className="text-right">{sale.customerEmail}</div>
            </>
          )}

          {sale.customerPhone && (
            <>
              <div className="font-medium">Phone:</div>
              <div className="text-right">{sale.customerPhone}</div>
            </>
          )}

          <div className="font-medium">Payment Method:</div>
          <div className="text-right capitalize">{sale.paymentMethod || 'Cash'}</div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="pb-3 text-left text-gray-800 font-semibold">Item</th>
              <th className="pb-3 text-right text-gray-800 font-semibold">Qty</th>
              <th className="pb-3 text-right text-gray-800 font-semibold">Price</th>
              <th className="pb-3 text-right text-gray-800 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {(sale.products || []).map((item, index) => {
              const price = item.priceAtSale || item.price || 0;
              const quantity = item.quantity || 0;
              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-3 text-gray-800">
                    <div>{item.product?.name || item.name || 'Unknown Item'}</div>
                    {item.product?.sku && (
                      <div className="text-xs text-gray-500">SKU: {item.product.sku}</div>
                    )}
                  </td>
                  <td className="py-3 text-right text-gray-800">{quantity}</td>
                  <td className="py-3 text-right text-gray-800">{formatCurrency(price)}</td>
                  <td className="py-3 text-right text-gray-800 font-medium">
                    {formatCurrency(price * quantity)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="text-right mb-6">
        <div className="text-2xl font-bold text-gray-900">
          Total: {formatCurrency(sale.totalAmount || sale.total || 0)}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center border-t-2 border-gray-800 pt-6">
        <p className="text-gray-800 font-medium text-lg">Thank you for your business!</p>
        <p className="mt-2 text-gray-700">Please keep this receipt for your records</p>
        <p className="mt-4 text-sm text-gray-600">This is a computer-generated receipt</p>
      </div>

      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .receipt {
            box-shadow: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt; 