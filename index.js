import express from "express"
import dotenv from "dotenv"
dotenv.config()
const app = express();
const port = process.env.PORT||3000;

// Mock stock data
let stockPrice = 100;

// Simulate stock price changes every second
setInterval(() => {
  const priceChange = (Math.random() - 0.5) * 4; // Random price change between -2 and +2
  stockPrice += priceChange;
}, 1000);

app.use(express.json());
app.get('/api/stock-price', (req, res) => {
    console.log(`Stock price: ${stockPrice}`);
    res.status(200).json({ price: stockPrice });
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
server.keepAliveTimeout = 60000; // 60 seconds
