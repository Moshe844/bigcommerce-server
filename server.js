import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());  // Middleware to parse incoming JSON requests

// Middleware to log the raw request body (for debugging purposes)
app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);  // Log headers
    console.log('Request Body:', req.body);  // Log the raw request body
    next();
});

// Endpoint to process payment requests
app.post('/api/payment', async (req, res) => {
    const { cardNumber, cardExp, cardCvv, amount, orderId } = req.body;

    console.log('Received payment data:', req.body);  // Log received payment data

    // Validate if amount is missing or invalid
    if (!amount || isNaN(amount)) {
        console.log('Amount is missing or invalid:', amount);  // Log invalid amount
        return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    // Ensure the amount is formatted correctly to two decimal places
    const amountFormatted = parseFloat(amount).toFixed(2);
    console.log('Formatted Amount:', amountFormatted);  // Log formatted amount

    const payload = {
        xKey: process.env.CARDKNOX_API_KEY, // Your Cardknox API key
        xVersion: '5.0.0',
        xSoftwareName: 'BigCommerceIntegration',
        xSoftwareVersion: '1.0',
        xCommand: 'cc:sale',
        xCardNum: cardNumber,
        xExp: cardExp,
        xCVV: cardCvv,
        xAmount: amountFormatted, // Use the formatted amount
        xOrderId: orderId,
    };

    console.log('Payload sent to Cardknox:', payload);  // Log the payload

    try {
        // Send payment request to Cardknox
        const response = await fetch('https://x1.cardknox.com/gatewayjson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log('Cardknox Response:', result);  // Log Cardknox response

        if (result.xResult === 'A') {
            res.status(200).json({ success: true, transactionId: result.xRefNum });
        } else {
            res.status(400).json({ success: false, message: result.xError });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
