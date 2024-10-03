import winston from 'winston';
import axios from "axios"
// Create a Winston logger with colorized output
const logger = winston.createLogger({
  level: 'info', // Log level
  format: winston.format.combine(
    winston.format.colorize(),  // Apply color to log level
    winston.format.timestamp(), // Add timestamp to log entries
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Output logs to console
    new winston.transports.File({ filename: 'app.log' }) // Also save logs to file
  ]
});
let initialBalance = 10000;
let balance = initialBalance;
let shares = 0;
let previousPrice = 100;
let profitLoss = 0;

const buyThreshold = 0.98;  // Buy when stock price drops by 2%
const sellThreshold = 1.03; // Sell when stock price rises by 3%

// Function to make trading decisions based on price changes
const trade = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/stock-price',{
        heaers:{
            'Connection':'keep-alive'
        }
    });
    const currentPrice = response.data.price;
    console.log(response.data);
    
    if (shares === 0 && currentPrice <= previousPrice * buyThreshold) {
      // Buy
      shares = Math.floor(balance / currentPrice); // Buy as many shares as possible
      balance -= shares * currentPrice;
      logger.info(`Bought ${shares} shares at $${currentPrice.toFixed(2)}. Balance: $${balance.toFixed(2)}`);
    } else if (shares > 0 && currentPrice >= previousPrice * sellThreshold) {
      // Sell
      balance += shares * currentPrice;
      profitLoss = balance - initialBalance;
     logger.info(`Sold ${shares} shares at $${currentPrice.toFixed(2)}. Balance: $${balance.toFixed(2)}, P/L: $${profitLoss.toFixed(2)}`);
      shares = 0; // Reset shares after selling
    }

    previousPrice = currentPrice; // Update the previous price for next trade
  } catch (error) {
    logger.error('Error fetching stock price:', error.message);
  }
};

// Trade every 5 seconds
setInterval(trade, 5000);
