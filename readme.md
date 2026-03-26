Here’s a clean and professional project description + technical requirements for your project Lagani Vitz (you can use this for documentation, portfolio, or proposals):

📌 Project Description — Lagani Vitz

Lagani Vitz is a modern, web-based investment and financial analytics platform designed to provide users with real-time insights into the stock market, with a particular focus on NEPSE (Nepal Stock Exchange). The platform empowers investors to monitor market trends, analyze financial data, and make informed investment decisions through an intuitive, responsive interface.

The system aggregates market data, financial reports, and company information, presenting them via interactive dashboards, charts, and filtering tools. Its goal is to simplify complex financial data, making it accessible for both beginner and advanced investors.

🚀 Key Features
- 📊 Live stock market data and real-time price tracking
- 🔍 Advanced filtering and stock search
- 📈 Interactive charts and technical analysis tools
- 📰 Financial news and company updates
- 📑 Financial reports and historical data
- 🔔 Notification system for market alerts
- 👤 User authentication and personalized watchlists
- 📱 Responsive design for both mobile and desktop

🛠️ Technical Requirements

🔷 **Frontend (React + Inertia.js)**
- Framework: React.js (with Hooks / Functional Components)
- Routing & SPA Engine: Inertia.js + React Router
- State Management: Context API / Redux (optional, based on scale)
- UI Library: Material UI / Bootstrap / Tailwind CSS (optional)
- Charting: Highcharts / Chart.js / Recharts
- HTTP Client: Axios / Fetch API
- Build Tool: Vite / Webpack
- Features:
  - SPA (Single Page Application) via Inertia.js for seamless navigation
  - Dynamic data rendering
  - Reusable components
  - Lazy loading for performance optimization

🔶 **Backend (Laravel)**
- Framework: Laravel (latest stable version)
- Inertia.js Server Side Rendering for React frontend integration
- Architecture: RESTful API
- Authentication: Laravel Sanctum / JWT
- Database: MySQL / PostgreSQL
- ORM: Eloquent
- Queue System: Redis / Database queues (for background jobs)
- Caching: Redis / Memcached
- API Security: Rate limiting, token-based authentication
- Features:
  - API endpoints for stock data, users, and analytics
  - Data aggregation and processing
  - Scheduled jobs (cron) for syncing market data
  - Role-based access control (optional)

🔗 **Integration & Tools**
- Version Control: Git (GitHub/GitLab)
- Deployment:
  - Frontend → Vercel / Netlify
  - Backend → VPS / AWS / DigitalOcean
- CI/CD: GitHub Actions (optional)
- WebSocket (optional): Laravel Echo + Pusher for real-time updates

⚙️ **System Requirements**
- Node.js ≥ 18
- PHP ≥ 8.1
- Composer
- MySQL ≥ 5.7
- Nginx / Apache

🎯 **Goal**

The primary goal of Lagani Vitz is to empower users with accurate, real-time financial data and analytical tools—making stock market investing more accessible, transparent, and efficient by leveraging technologies such as React, Inertia.js, and Laravel.

