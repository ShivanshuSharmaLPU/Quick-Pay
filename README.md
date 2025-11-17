QuickPay 🚀

QuickPay is a digital payment application designed to facilitate seamless transactions between users. It provides a secure and efficient way to send and receive payments, track transaction history, and manage accounts with ease. The platform supports authentication, authorization, and integrates various financial features.

📌 Table of Contents

Features

Tech Stack

Installation & Setup

API Endpoints

Future Enhancements

Contributing

License

Contact

🔥 Features

✅ User Authentication: Secure signup, login, and JWT-based authentication.

💰 Transactions: Send and receive payments between users.

📜 Transaction History: View past transactions with timestamps and details.

🔒 Security: Implements encryption and secure storage for sensitive data.

🛠 Admin Dashboard: Admin functionality for user and transaction management.

🔔 Notifications: Real-time alerts for transactions and account updates.

🛠 Tech Stack
Frontend:

⚛ React.js

🎨 Tailwind CSS

Backend:

🚀 Node.js & Express.js

🗄 MongoDB with Mongoose

📊 Prisma ORM

Security:

🔑 JWT

🔐 bcrypt

Deployment:

☁ AWS / Cloudflare

🛢 Neon

⚙ Installation & Setup
Prerequisites

Node.js

MongoDB

PostgreSQL (optional for Prisma)

### Steps to Run Locally

⚙ Installation & Setup
1. Clone the repository:
git clone https://github.com/ShivanshuSharmaLPU/Quick-Pay.git
cd quickpay

2. Install dependencies:
npm install

3. Set up environment variables in a .env file:
JWT_SECRET=your_jwt_secret
POSTGRES_URL=your_postgres_database_url

4. Run the backend server:
npm start

5. Navigate to the frontend directory and start the React app:
cd client
npm start

📡 API Endpoints
Method	Endpoint	Description
🔹 POST	/api/auth/signup	Register a new user
🔹 POST	/api/auth/login	Authenticate user & get token
🔹 GET	/api/users	Fetch user details
🔹 POST	/api/transaction	Initiate payment transaction
🔹 GET	/api/transactions	Get transaction history
🚀 Future Enhancements

🔗 UPI & Bank Account Integration

🧠 AI-powered Fraud Detection

🤝 Peer-to-Peer (P2P) Lending System

💱 Support for Multiple Currencies

🤝 Contributing

Contributions are welcome!
Feel free to fork the repository and create a pull request.
