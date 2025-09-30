# Garage360 - Vehicle Service Management System

A comprehensive, modern vehicle service management web application built with React.js and Node.js, featuring role-based access control and a professional dark theme interface.

## 🚗 Features

### Customer Features
- **Vehicle Registration**: Add and manage multiple vehicles
- **Service Booking**: Schedule services with preferred dates
- **Service History**: Track all past and current service requests
- **Real-time Updates**: View service status and progress
- **Profile Management**: Manage personal information and contact details

### Mechanic Features
- **Job Management**: View and manage assigned service jobs
- **Work History**: Track completed jobs and performance
- **Stock Management**: Access parts inventory and stock levels
- **Job Updates**: Update job status and add notes

### Manager Features
- **Customer Management**: View and manage customer accounts
- **Mechanic Management**: Assign jobs and manage mechanic workload
- **Service Requests**: Oversee all service requests and assignments
- **Parts Management**: Manage inventory and stock levels
- **Analytics Dashboard**: Monitor business performance and metrics

### System Features
- **Role-Based Access Control**: Secure authentication with different user roles
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Data**: Live updates for service status and inventory
- **Modern UI**: Professional dark theme with blue accent colors
- **Data Security**: JWT-based authentication and secure API endpoints

## 🎨 Design & User Experience

- **Dark Theme**: Modern, professional dark interface with blue accents
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Role-based navigation with clear user flows
- **Visual Feedback**: Loading states, success messages, and error handling
- **Accessibility**: Clean typography and high contrast colors

## 🛠️ Tech Stack

### Frontend
- **React.js 18+**: Modern React with hooks and functional components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing for single-page application
- **React Icons**: Comprehensive icon library (Feather Icons)
- **Custom Components**: Reusable UI components with consistent styling

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database for data persistence
- **JWT**: JSON Web Tokens for secure authentication
- **bcrypt**: Password hashing for security
- **CORS**: Cross-origin resource sharing middleware

### Development Tools
- **npm**: Package management
- **Git**: Version control
- **VS Code**: Recommended development environment

## 📁 Project Structure

```
Garage360/
├── client/                 # React frontend application
│   ├── public/            # Static assets and images
│   │   ├── car-images/    # Vehicle model images
│   │   └── background/    # Background images
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── Navbar.js
│   │   │   └── RoleBasedDashboard.js
│   │   ├── pages/         # Main application pages
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── CustomerDashboard.js
│   │   │   ├── MechanicDashboard.js
│   │   │   ├── ManagerDashboard.js
│   │   │   ├── BookService.js
│   │   │   ├── MyVehicles.js
│   │   │   ├── Services.js
│   │   │   └── [other pages]
│   │   ├── App.js         # Main application component
│   │   ├── index.js       # Application entry point
│   │   └── index.css      # Global styles and Tailwind imports
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── postcss.config.js  # PostCSS configuration
├── server/                # Node.js backend application
│   ├── config/           # Configuration files
│   │   └── database.js   # PostgreSQL database configuration
│   ├── routes/           # API route handlers
│   │   ├── auth.js       # Authentication routes
│   │   ├── customers.js  # Customer management
│   │   ├── mechanics.js  # Mechanic management
│   │   ├── vehicles.js   # Vehicle management
│   │   ├── services.js   # Service management
│   │   ├── service-requests.js # Service booking and tracking
│   │   ├── parts.js      # Parts inventory management
│   │   └── [other routes]
│   ├── index.js          # Server entry point
│   └── package.json      # Backend dependencies
└── README.md             # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 16+**: [Download from nodejs.org](https://nodejs.org/)
- **PostgreSQL 13+**: [Download from postgresql.org](https://www.postgresql.org/download/)
- **Git**: [Download from git-scm.com](https://git-scm.com/downloads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tino-sabu/Garage360.git
   cd Garage360
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Database Setup**
   
   Create a PostgreSQL database named `garage360` and configure the connection in `server/config/database.js`.
   
   The database schema and initial data should already be set up. If not, contact the development team for the schema files.

5. **Environment Configuration**
   
   Create a `.env` file in the server directory with the following variables:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=garage360
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   JWT_SECRET=your_jwt_secret_key
   ```

6. **Start the Application**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   npm start
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm start
   ```

7. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

## � User Roles & Access

### Customer Account
- Register as a new customer
- Add vehicles to your account
- Book services for your vehicles
- Track service progress
- View service history

### Mechanic Account
- View assigned jobs
- Update job status
- Access parts inventory
- View work history

### Manager Account
- Manage customers and mechanics
- Assign service requests to mechanics
- Oversee all operations
- Manage parts inventory
- View analytics and reports

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Customers
- `GET /api/customers` - Get all customers (Manager only)
- `PUT /api/customers/:id` - Update customer information

### Vehicles
- `GET /api/vehicles` - Get user's vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle information
- `DELETE /api/vehicles/:id` - Remove vehicle

### Services
- `GET /api/services` - Get available services
- `POST /api/service-requests` - Book a service
- `GET /api/service-requests/customer` - Get customer's service requests
- `GET /api/service-requests/mechanic/jobs` - Get mechanic's assigned jobs

### Parts Management
- `GET /api/parts` - Get parts inventory
- `PUT /api/parts/:id` - Update part information (Manager only)

## 🎯 Current Features Status

✅ **Completed Features:**
- User authentication and registration
- Role-based dashboards
- Vehicle management
- Service booking (date-only selection)
- Customer dashboard with vehicle overview
- Mechanic dashboard with completed jobs history
- Manager dashboard with customer/mechanic management
- Parts inventory management
- Responsive design with dark theme
- Service catalog with filtering

🚧 **In Progress:**
- Real-time job status updates
- Advanced reporting and analytics
- Payment processing integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Notes

- **Database**: All database schemas and initial data are already loaded in production
- **Authentication**: Uses JWT tokens with role-based access control
- **Styling**: Tailwind CSS with custom dark theme configuration
- **Images**: Vehicle images are optimized and stored in WebP/AVIF formats
- **Responsive**: Mobile-first design approach

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

The application is designed to be deployed with:
- Frontend: Vercel, Netlify, or similar static hosting
- Backend: Heroku, Digital Ocean, or similar Node.js hosting
- Database: PostgreSQL hosting service

## 📞 Support

For support and questions, please contact the development team or create an issue in the GitHub repository.

---

**Built with ❤️ by the Garage360 Team**