import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('src'));

// Payment processing route
app.post('/process-payment', async (req, res) => {
    const { cardNumber, cardExp, cardCvv, amount } = req.body;

    console.log('Received Payment Data:', { cardNumber, cardExp, cardCvv, amount }); // Debug log

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ success: false, message: 'Amount Required' });
    }

    const payload = {
        xKey: 'cardktestaccoudev7973ce78b7584012a3ad439b1d65', // Replace with your Cardknox API key
        xVersion: '5.0.0',
        xSoftwareName: 'BigCommerceIntegration',
        xSoftwareVersion: '1.0',
        xCommand: 'cc:sale',
        xCardNum: cardNumber,
        xExp: cardExp,
        xCVV: cardCvv,
        xAmount: amount,
    };

    try {
        const response = await fetch('https://x1.cardknox.com/gatewayjson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.xResult === 'A') {
            res.status(200).json({ success: true, transactionId: result.xRefNum });
        } else {
            res.status(400).json({ success: false, message: result.xError });
        }
    } catch (error) {
        console.error('Error interacting with Cardknox:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});