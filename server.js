import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint to process payment requests
app.post('/api/payment', async (req, res) => {
    const { cardNumber, cardExp, cardCvv, amount, orderId } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const payload = {
        xKey: process.env.CARDKNOX_API_KEY, // Ensure your API key is stored securely
        xVersion: '5.0.0',
        xSoftwareName: 'BigCommerceIntegration',
        xSoftwareVersion: '1.0',
        xCommand: 'cc:sale',
        xCardNum: cardNumber,
        xExp: cardExp,
        xCVV: cardCvv,
        xAmount: amount,
        xOrderId: orderId,
    };

    try {
        // Send payment request to Cardknox
        const response = await fetch('https://x1.cardknox.com/gatewayjson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.xResult === 'A') {
            // Payment Approved
            res.status(200).json({ success: true, transactionId: result.xRefNum });
        } else {
            // Payment Declined
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
