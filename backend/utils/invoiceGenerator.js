const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(stream);

  // Header
  doc
    .fillColor('#0D5C75') // Deep Teal
    .fontSize(24)
    .text('Neel India', 50, 45)
    .fillColor('#333333')
    .fontSize(10)
    .text('Premium Dresses & Traditional Wear', 50, 75)
    .text('Email: support@neel.in | Web: www.neel.in', 50, 90)
    .moveDown();

  // Invoice Title & Info
  doc
    .fontSize(20)
    .text('TAX INVOICE', 350, 45, { align: 'right' })
    .fontSize(10)
    .text(`Invoice No: ${order.invoiceNumber || 'N/A'}`, 350, 70, { align: 'right' })
    .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}`, 350, 85, { align: 'right' })
    .text(`Order ID: ${order.orderId}`, 350, 100, { align: 'right' })
    .text(`Payment ID: ${order.paymentId}`, 350, 115, { align: 'right' });

  // Divider Line
  doc.moveTo(50, 135).lineTo(550, 135).strokeColor('#dddddd').stroke();

  // Shipping Address
  const addr = order.shippingAddress;
  doc
    .fontSize(12)
    .fillColor('#0D5C75')
    .text('Billed To (Shipping Address):', 50, 150)
    .fillColor('#333333')
    .fontSize(10)
    .text(addr.fullName, 50, 170)
    .text(`Mobile: ${addr.mobile}`, 50, 185)
    .text(`${addr.houseNo}, ${addr.streetAddress}`, 50, 200)
    .text(`${addr.area}, ${addr.city}, ${addr.district}`, 50, 215)
    .text(`${addr.state}, ${addr.country} - ${addr.pincode}`, 50, 230)
    .text(`Landmark: ${addr.landmark || 'N/A'}`, 50, 245);

  // Table Headers
  const tableTop = 280;
  doc
    .fontSize(10)
    .fillColor('#ffffff')
    .rect(50, tableTop, 500, 20)
    .fill('#0D5C75')
    .stroke();

  doc
    .fillColor('#ffffff')
    .text('S.No', 60, tableTop + 5)
    .text('Product Name', 100, tableTop + 5)
    .text('Size', 280, tableTop + 5)
    .text('Price', 330, tableTop + 5, { width: 60, align: 'right' })
    .text('Qty', 410, tableTop + 5, { width: 30, align: 'right' })
    .text('Total', 470, tableTop + 5, { width: 70, align: 'right' });

  let y = tableTop + 20;

  // Table rows
  order.items.forEach((item, index) => {
    doc
      .fillColor('#333333')
      .text(index + 1, 60, y + 5)
      .text(item.name, 100, y + 5, { width: 170 })
      .text(item.size, 280, y + 5)
      .text(`Rs. ${item.price.toFixed(2)}`, 330, y + 5, { width: 60, align: 'right' })
      .text(item.quantity, 410, y + 5, { width: 30, align: 'right' })
      .text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 470, y + 5, { width: 70, align: 'right' });

    y += 25;
  });

  // Totals Area
  y += 10;
  doc.moveTo(50, y).lineTo(550, y).strokeColor('#dddddd').stroke();
  y += 10;

  doc
    .fontSize(10)
    .text('Subtotal:', 350, y, { width: 100, align: 'right' })
    .text(`Rs. ${order.subtotal.toFixed(2)}`, 470, y, { width: 70, align: 'right' });

  y += 20;
  doc
    .text('GST (18%):', 350, y, { width: 100, align: 'right' })
    .text(`Rs. ${order.gst.toFixed(2)}`, 470, y, { width: 70, align: 'right' });

  y += 20;
  doc
    .text('Shipping Charges:', 350, y, { width: 100, align: 'right' })
    .text(`Rs. ${order.shippingCharge.toFixed(2)}`, 470, y, { width: 70, align: 'right' });

  y += 20;
  doc
    .fontSize(12)
    .fillColor('#0D5C75')
    .text('Grand Total:', 350, y, { width: 100, align: 'right' })
    .text(`Rs. ${order.grandTotal.toFixed(2)}`, 470, y, { width: 70, align: 'right' });

  // Footer note
  doc
    .fontSize(10)
    .fillColor('#888888')
    .text('This is a computer-generated invoice. No signature is required.', 50, 700, { align: 'center' })
    .text('Thank you for shopping with Neel India!', 50, 715, { align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF };
