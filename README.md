# Garage360 - Vehicle Service Management System

A comprehensive vehicle service management website with PostgreSQL integration, featuring a modern dark theme design.

## 🚗 Features

- **User Management**: Customer, Admin, Mechanic, and Manager roles
- **Vehicle Management**: Registration, tracking, and service history
- **Service Booking**: Online service request system
- **Inventory Management**: Parts tracking and stock management
- **Billing & Payments**: Invoice generation and payment processing
- **Dashboard**: Role-based dashboards with analytics

## 🎨 Design

- Dark theme with blue accent colors
- Modern, clean interface
- Responsive design for all devices
- Professional typography

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **UI Components**: Custom components with dark theme

## 📁 Project Structure

```
Garage360/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── package.json
├── database/              # PostgreSQL schemas
│   ├── migrations/
│   └── seeds/
└── docs/                  # Documentation
```

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm run install-all`
3. Set up PostgreSQL database
4. Configure environment variables
5. Run the application: `npm run dev`

## 📄 License

MIT License - see LICENSE file for details