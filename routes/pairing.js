const express = require('express');

module.exports = function(client) {
    const router = express.Router();

    router.get('/pair', async (req, res) => {
        try {
            const code = await client.pairing.generatePairingCode('255765457691');
            res.json({ pairingCode: code });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    return router;
};
