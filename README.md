# 🚌 BusBuddy

**BusBuddy** is a comprehensive transit management system designed to optimize public transportation through smart scheduling, real-time tracking, data analytics, and driver rostering. Built with scalability and usability in mind, it’s a modular platform catering to transport authorities, city planners, and operators.

## 🚀 Features

- 📈 **Passenger Demand Forecasting** using BiLSTM
- 🗺️ **Real-Time Bus Tracking** with GPS integration
- 🧑‍💼 **Driver Rostering** for efficient workforce scheduling
- 📊 **Statistical Dashboards** for insights into ridership & operations
- 📅 **Dynamic Scheduling Engine** for adaptive route and frequency adjustments
- 🧠 **AI-based Route Optimization** *(planned)*

## 🛠️ Tech Stack

| Component        | Technology                     |
|------------------|---------------------------------|
| Frontend         | React.js / Angular.js           |
| Backend          | Node.js / Python (Flask/FastAPI)|
| Database         | PostgreSQL / MongoDB            |
| Real-time        | WebSockets, GPS APIs            |
| ML Model         | BiLSTM for demand prediction    |

## 🧱 Project Modules

1. **Scheduling Platform** – Adjusts frequency based on predicted demand  
2. **Planning Platform** – Long-term route planning & EV transition  
3. **Rostering Platform** – Driver management & fair shift planning  
4. **Operations Platform** – Live vehicle & crew monitoring  
5. **Statistics Platform** – Analytical dashboards and trend tracking


## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/Naveen-117/BusBuddy.git
cd BusBuddy

# Install backend dependencies
cd backend
npm install  # or pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install

# Start the development servers
npm start
