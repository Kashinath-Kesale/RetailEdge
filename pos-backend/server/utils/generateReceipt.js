const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateReceipt = (sale, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Title
    doc.fontSize(20).text('Sales Receipt', { align: 'center' });
    doc.moveDown();

    // Receipt info
    doc.fontSize(12).text(`Receipt ID: ${sale._id}`);
    doc.text(`Customer Name: ${sale.customerName || 'N/A'}`);
    doc.text(`Payment Method: ${sale.paymentMethod}`);
    doc.text(`Date: ${new Date(sale.createdAt).toLocaleString()}`);
    doc.moveDown();

    // Items Header
    doc.fontSize(14).text('Items:', { underline: true });
    doc.moveDown(0.5);

    // Items list
    sale.products.forEach((item, index) => {
      const productName = item.product?.name || 'Unknown Product';
      const quantity = item.quantity || 0;
      const price = item.priceAtSale || 0;
      const total = quantity * price;

      doc.text(
        `${index + 1}. ${productName} | Qty: ${quantity} | Price: ₹${price} | Total: ₹${total}`
      );
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Amount: ₹${sale.totalAmount}`, {
      align: 'right',
      underline: true,
    });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', (err) => reject(err));
  });
};

module.exports = generateReceipt;
