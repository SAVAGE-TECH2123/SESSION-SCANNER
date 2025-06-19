// 📁 server.js const express = require("express"); const cors = require("cors"); const app = express(); const pairingRoute = require("./routes/pairing");

app.use(cors()); app.use(express.json()); app.use(express.urlencoded({ extended: true }));

app.use("/", express.static("public")); app.use("/api", pairingRoute);

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log(✅ Server running on port ${PORT}));

