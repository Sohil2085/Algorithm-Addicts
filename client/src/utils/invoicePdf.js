import jsPDF from 'jspdf';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a well-formatted PDF representation of an invoice.
 * @param {Object} invoice The invoice object containing details.
 */
export const downloadInvoicePDF = async (invoice) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // FinBridge Brand Colors
            const primaryColor = [59, 130, 246]; // Blue 500
            const textColor = [15, 23, 42]; // Slate 900
            const textMuted = [100, 116, 139]; // Slate 500

            // Formatters
            const formatCurrency = (amount) => {
                return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
            };

            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY
            };

            const invoiceId = invoice.id?.toString().slice(-6) || 'N/A';

            // --- Header Section ---
            // Logo / Branding
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(...primaryColor);
            doc.text('FinBridge', 14, 22);

            // Tagline
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...textMuted);
            doc.text('Accelerating MSME Growth with Instant Liquidity', 14, 28);

            // Document Title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(16);
            doc.setTextColor(...textColor);
            doc.text('INVOICE SUMMARY', pageWidth - 14, 22, { align: 'right' });

            // Date Generated
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...textMuted);
            doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 14, 28, { align: 'right' });

            // Divider Line
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.setLineWidth(0.5);
            doc.line(14, 35, pageWidth - 14, 35);

            // --- Details Grid Section ---
            doc.setFontSize(10);

            // Left Column (MSME & Buyer Details)
            let startY = 45;

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textMuted);
            doc.text('MSME DETAILS', 14, startY);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textColor);
            doc.text('Name:', 14, startY + 8);
            doc.setFont('helvetica', 'normal');
            doc.text(invoice.msmeName || 'N/A', 40, startY + 8);

            doc.setFont('helvetica', 'bold');
            doc.text('Invoice Ref:', 14, startY + 16);
            doc.setFont('helvetica', 'normal');
            doc.text(`#${invoiceId}`, 40, startY + 16);

            doc.setFont('helvetica', 'bold');
            doc.text('Buyer GSTIN:', 14, startY + 24);
            doc.setFont('helvetica', 'normal');
            doc.text(invoice.buyerGstin || 'N/A', 40, startY + 24);

            doc.setFont('helvetica', 'bold');
            doc.text('Status:', 14, startY + 32);
            doc.setFont('helvetica', 'normal');
            doc.text((invoice.status || 'N/A').toUpperCase(), 40, startY + 32);

            // Right Column (Financial & Risk Details)
            const rightColX = pageWidth / 2 + 10;

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textMuted);
            doc.text('FINANCIAL SNAPSHOT', rightColX, startY);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...textColor);
            doc.text('Amount:', rightColX, startY + 8);
            doc.setFont('helvetica', 'normal');
            doc.text(formatCurrency(invoice.amount), rightColX + 30, startY + 8);

            doc.setFont('helvetica', 'bold');
            doc.text('Due Date:', rightColX, startY + 16);
            doc.setFont('helvetica', 'normal');
            doc.text(formatDate(invoice.dueDate || invoice.createdAt), rightColX + 30, startY + 16);

            doc.setFont('helvetica', 'bold');
            doc.text('Credit Score:', rightColX, startY + 24);
            doc.setFont('helvetica', 'normal');
            doc.text(`${invoice.creditScore || 'N/A'} / 100`, rightColX + 30, startY + 24);

            doc.setFont('helvetica', 'bold');
            doc.text('Risk Level:', rightColX, startY + 32);
            doc.setFont('helvetica', 'normal');
            const riskLevel = invoice.riskLevel ? invoice.riskLevel.charAt(0).toUpperCase() + invoice.riskLevel.slice(1).toLowerCase() : 'N/A';
            doc.text(`${riskLevel} Risk`, rightColX + 30, startY + 32);

            // --- Table Section ---
            const tableStartY = startY + 45;

            const tableData = [
                ['Invoice ID', `#${invoiceId}`],
                ['MSME Name', invoice.msmeName || 'N/A'],
                ['Buyer GSTIN', invoice.buyerGstin || 'N/A'],
                ['Invoice Amount', formatCurrency(invoice.amount)],
                ['Issue Date', formatDate(invoice.createdAt)],
                ['Due Date', formatDate(invoice.dueDate || invoice.createdAt)],
                ['Risk Assessment', `${riskLevel} Risk (Score: ${invoice.creditScore || 'N/A'})`],
                ['System Status', (invoice.status || 'N/A').toUpperCase()]
            ];

            if (invoice.expectedReturn) {
                tableData.push(['Expected Return', `${invoice.expectedReturn}%`]);
            }

            autoTable(doc, {
                startY: tableStartY,
                head: [['Field', 'Value']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [241, 245, 249], // Slate 100
                    textColor: [15, 23, 42],
                    fontStyle: 'bold',
                    lineWidth: 0.1,
                    lineColor: [226, 232, 240]
                },
                bodyStyles: {
                    textColor: [51, 65, 85], // Slate 700
                    lineWidth: 0.1,
                    lineColor: [226, 232, 240]
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252] // Slate 50
                },
                margin: { top: 10, right: 14, left: 14, bottom: 20 }
            });

            // --- Footer Section ---
            // Minimum space required for footer
            const finalY = (doc.lastAutoTable || {}).finalY || tableStartY + 50;

            doc.setFontSize(9);
            doc.setTextColor(...textMuted);
            doc.setFont('helvetica', 'italic');
            doc.text('Note: Buyer agrees to pay via the FinBridge platform only.', 14, pageHeight - 20);

            doc.setFont('helvetica', 'normal');
            doc.text('Generated by FinBridge • Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Page Number
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
            }

            // Save the PDF
            doc.save(`FinBridge_Invoice_${invoiceId}.pdf`);

            // Small delay to simulate processing and ensure state updates visibly
            setTimeout(() => {
                resolve();
            }, 800);
        } catch (error) {
            console.error('Error generating PDF:', error);
            reject(error);
        }
    });
};
