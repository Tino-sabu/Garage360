# Garage360 - Vehicle Service Management System
Live at:https://garage360.vercel.app/

A comprehensive, modern vehicle service management web application built with React.js and Node.js, featuring role-based access control and a professional dark theme interface.

## ✨ Recent Updates (October 2025)

### Mobile Responsiveness & UI Enhancements
- **Complete Mobile Optimization**: Full mobile-responsive redesign for all pages
- **PageHeader Component**: Created reusable page header component with:
  - Black background with white centered text
  - Back arrow button on the left (no text)
  - Sticky positioning below navbar
  - Applied to: Assign Requests, Parts Management, Customer Details, Mechanic Details, Salary Payments
- **Mobile Navigation**: 
  - Hamburger menu from top-left corner
  - Slide-out navigation panel with solid black background
  - User avatar positioned at top-right on mobile
  - Smooth animations and touch-optimized interactions
- **Manager Dashboard Mobile View**:
  - Stats cards in single row (3 columns) on mobile
  - Management tools in 2-column grid on mobile
  - Clear All Requests button moved to bottom on mobile only
  - Centered layout for better visual hierarchy
- **Responsive Spacing & Typography**:
  - Added xs: breakpoint (475px) to Tailwind config
  - Consistent padding: `px-3 xs:px-4 sm:px-6` across all pages
  - Progressive font sizes from mobile to desktop
  - Better touch targets for mobile interaction
- **Landing Page**: Non-scrollable design that fits mobile screens perfectly
- **Container Alignment**: Consistent `max-w-7xl` containers with proper centering

### Code Quality & Architecture
- **Component Reusability**: Created PageHeader component used across 5+ pages
- **Consistent Styling**: Unified responsive patterns across all pages
- **Mobile-First Approach**: All layouts designed for mobile first, then enhanced for larger screens
- **Touch Optimization**: Improved button sizes and spacing for mobile touch interaction
- **Performance**: Optimized padding and margins for faster mobile rendering

### Security & Cleanup
- **Code Optimization**: Removed 37+ unused test and migration files
- **Security Enhancement**: Enhanced .gitignore to exclude all .env files and sensitive data
- **Git History Cleanup**: Removed .env files from git tracking
- **Package Cleanup**: Fixed duplicate Tailwind CSS dependencies in client package.json
- **Asset Management**: Optimized image usage across components
- **Clean Architecture**: Streamlined codebase for better maintainability

### User Experience
- **Consistent Navigation**: Back buttons work consistently across all non-dashboard pages
- **Visual Hierarchy**: Clear page headers help users understand their location
- **Mobile Usability**: Filter sections, stats cards, and forms optimized for mobile
- **Responsive Tables**: Improved table layouts for mobile viewing
- **Better Readability**: Adjusted text sizes and spacing for mobile screens

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
- **Mechanic Management**: Assign jobs and manage mechanic
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
- **Tailwind CSS**: Utility-first CSS framework with custom responsive design
  - Custom xs: breakpoint (475px) for phone optimization
  - Extended color palette with dark theme
  - Custom utility classes for mobile-first design
- **React Router v6**: Client-side routing for single-page application
- **React Icons**: Comprehensive icon library (Feather Icons)
- **Axios**: HTTP client for API communication
- **Custom Components**: 
  - PageHeader: Reusable header with back navigation
  - Navbar: Mobile-responsive with slide-out menu
  - RoleBasedDashboard: Dynamic dashboard routing
  - Consistent card and form components

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **PostgreSQL**: Relational database for data persistence
- **Supabase**: Backend-as-a-Service (optional) for cloud PostgreSQL, authentication, and real-time features
- **JWT**: JSON Web Tokens for secure authentication
- **bcrypt**: Password hashing for security
- **CORS**: Cross-origin resource sharing middleware
- **Helmet**: Security middleware for Express
- **Express Rate Limit**: Rate limiting middleware
- **Winston**: Logging library

### Development Tools
- **npm**: Package management
- **Nodemon**: Development server with hot reload
- **Git**: Version control
- **PostCSS**: CSS processing tool
- **Autoprefixer**: CSS vendor prefixing

## 📁 Project Structure

```
Garage360/
├── client/                 # React frontend application
│   ├── public/            # Static assets and images
│   │   ├── *.avif         # Optimized vehicle images (AVIF format)
│   │   ├── pic1.jpg       # Landing page background
│   │   ├── pic2.jpeg      # Dashboard backgrounds
│   │   └── index.html     # HTML entry point
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── Navbar.js              # Mobile-responsive navigation
│   │   │   ├── PageHeader.js          # Reusable page header with back button
│   │   │   └── RoleBasedDashboard.js  # Role-based routing
│   │   ├── pages/         # Main application pages (all mobile-optimized)
│   │   │   ├── LandingPage.js         # Non-scrollable landing page
│   │   │   ├── Login.js               # Authentication page
│   │   │   ├── Register.js            # User registration
│   │   │   ├── CustomerDashboard.js   # Customer overview
│   │   │   ├── MechanicDashboard.js   # Mechanic job view
│   │   │   ├── ManagerDashboard.js    # Manager control panel (mobile-optimized)
│   │   │   ├── BookService.js         # Service booking form
│   │   │   ├── MyVehicles.js          # Vehicle management
│   │   │   ├── AddVehicle.js          # Add new vehicle
│   │   │   ├── Services.js            # Service catalog
│   │   │   ├── AssignRequests.js      # Service assignment (with PageHeader)
│   │   │   ├── PartsManagement.js     # Inventory management (with PageHeader)
│   │   │   ├── CustomerDetails.js     # Customer info (with PageHeader)
│   │   │   ├── MechanicDetail.js      # Mechanic info (with PageHeader)
│   │   │   ├── SalaryPayments.js      # Payment history (with PageHeader)
│   │   │   ├── CustomerManagement.js  # Customer admin
│   │   │   ├── MechanicManagement.js  # Mechanic admin
│   │   │   └── [other pages]
│   │   ├── config/        # Configuration files
│   │   │   ├── api.js     # API endpoint configurations
│   │   │   └── supabase.js # Supabase client setup
│   │   ├── App.js         # Main application component
│   │   ├── index.js       # Application entry point
│   │   └── index.css      # Global styles, Tailwind imports, custom utilities
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind CSS with custom xs breakpoint
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
Screenshots
<img width="1918" height="968" alt="image" src="https://github.com/user-attachments/assets/de83ed45-1702-4bfd-8d35-2e70b50c0ab4" />
<img width="1918" height="968" alt="image" src="https://github.com/user-attachments/assets/9732337d-7205-4d5b-aaeb-b01f007eae95" />
Manager :
<img width="1918" height="970" alt="image" src="https://github.com/user-attachments/assets/e941721f-8551-453f-af3c-8c73a17da9a9" />
<img width="1918" height="967" alt="image" src="https://github.com/user-attachments/assets/4a0bae9d-7abb-4752-a99b-1092bd302d77" />
<img width="1918" height="961" alt="image" src="https://github.com/user-attachments/assets/f74ec1c4-2d2f-4a0f-af6e-c55822ec6bab" />
<img width="1918" height="963" alt="image" src="https://github.com/user-attachments/assets/f3e7db92-6122-42cd-b5d1-c4ff07fe38da" />
<img width="1918" height="966" alt="image" src="https://github.com/user-attachments/assets/d3eafe36-a6a7-4d87-b7ca-5cd0608dff00" />
Customer :
<img width="1918" height="971" alt="image" src="https://github.com/user-attachments/assets/7d3481b8-3818-440b-9aab-041416c0b0fd" />
<img width="1918" height="966" alt="image" src="https://github.com/user-attachments/assets/48fd88bc-980b-4ea0-8fe5-444abd80d1e6" />
<img width="1918" height="966" alt="image" src="https://github.com/user-attachments/assets/175335a4-c2b8-4fd9-b99d-0a3169dbddb5" />
<img width="1918" height="966" alt="image" src="https://github.com/user-attachments/assets/910cb059-a04d-468a-bb70-733c2be51deb" />
<img width="1918" height="970" alt="image" src="https://github.com/user-attachments/assets/e6ce6be7-d0b9-4c56-8b88-19a89c93c848" />
Mechanic :
<img width="1918" height="972" alt="image" src="https://github.com/user-attachments/assets/f2d389cc-4ffa-4801-8c15-cd77ce6bf343" />
<img width="1918" height="963" alt="image" src="https://github.com/user-attachments/assets/686ee640-6b7c-4df1-95d9-462636a19d96" />
<img width="1918" height="968" alt="image" src="https://github.com/user-attachments/assets/7000c64c-8049-48a8-b9c1-ed9a8e55b1e3" />
<img width="1918" height="972" alt="image" src="https://github.com/user-attachments/assets/53fe2db8-bf8c-48b6-a453-407bda78b3ea" />

Screen Recording 

https://github.com/user-attachments/assets/82e40333-e42d-4ed9-9545-c774a6df8883

https://github.com/user-attachments/assets/7c2aaea8-a230-4fac-b2df-893428e7fb79

https://github.com/user-attachments/assets/0ee6ad56-f76d-4695-bf7c-c9abb3cbf300

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
   
   You have two options for database setup:
   
   **Option A: Supabase (Recommended - Cloud Database)**
   1. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
   2. Quick steps:
      - Create account at [supabase.com](https://supabase.com)
      - Create new project named "garage360"
      - Copy your credentials and update `.env` file
      - Run SQL schema in Supabase SQL Editor
   3. Follow the [Migration Checklist](./MIGRATION_CHECKLIST.md)
   
   **Option B: Local PostgreSQL**
   1. Create a PostgreSQL database named `garage360`
   2. Configure connection in `server/config/database.js`
   3. Run the schema files to create tables
   
   The database schema and initial data should already be set up. If not, contact the development team for the schema files.

5. **Environment Configuration**
   
   **⚠️ SECURITY WARNING: Never commit actual API keys or secrets to git!**
   
   **Backend Configuration** - Create `.env` file in the `server` directory:
   
   **For Supabase (Cloud Database):**
   ```env
   # Supabase Configuration
   # Get these from: https://app.supabase.com/project/_/settings/api
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your_actual_anon_key_here
   SUPABASE_SERVICE_KEY=your_actual_service_role_key_here
   SUPABASE_DB_URL=postgresql://postgres.xxxxx:your_password@aws-0-xxx.pooler.supabase.com:5432/postgres
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=generate_a_secure_random_string_here
   CORS_ORIGIN=http://localhost:3000
   ```
   
   **For Local PostgreSQL:**
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=garage360
   DB_USER=your_db_username
   DB_PASSWORD=your_secure_password
   
   PORT=5000
   JWT_SECRET=generate_a_secure_random_string_here
   CORS_ORIGIN=http://localhost:3000
   ```
   
   **Frontend Configuration** - Create `.env` file in the `client` directory:
   ```env
   # Supabase Configuration for Client
   # Get these from: https://app.supabase.com/project/_/settings/api
   REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_actual_anon_key_here
   
   # Note: NEVER use service_role key on client side!
   ```
   
   **Important Notes:**
   - Copy `.env.example` files and rename to `.env`
   - Replace all placeholder values with your actual credentials
   - Generate secure random strings for JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - The `.env` files are already in `.gitignore` and will not be committed
   - See `.env.example` in server and client folders for all configuration options

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
- `GET /api/vehicles/brands` - Get all vehicle brands from cartypes table
- `GET /api/vehicles/brands/:brand/models` - Get models by brand from cartypes table
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle information
- `DELETE /api/vehicles/:id` - Remove vehicle

### Services
- `GET /api/services` - Get available services
- `POST /api/service-requests` - Book a service
- `GET /api/service-requests/customer` - Get customer's service requests
- `GET /api/service-requests/mechanic/jobs` - Get mechanic's assigned jobs
- `PUT /api/service-requests/:id/status` - Update service request status

### Parts Management
- `GET /api/parts` - Get parts inventory
- `PUT /api/parts/:id` - Update part information (Manager only)
- `GET /api/parts?category=<category>` - Filter parts by category
- `GET /api/parts?search=<term>` - Search parts by name or code

### Mechanics
- `GET /api/mechanics` - Get all mechanics (Manager only)
- `PUT /api/mechanics/:id` - Update mechanic information

## 📊 Database Schema & API Mapping

### Database Tables and Relationships

```mermaid
erDiagram
    CUSTOMERS ||--o{ VEHICLES : owns
    CUSTOMERS ||--o{ SERVICE_REQUESTS : books
    VEHICLES ||--o{ SERVICE_REQUESTS : requires
    MECHANICS ||--o{ SERVICE_REQUESTS : assigned_to
    SERVICES }o--o{ SERVICE_REQUESTS : through_service_request_services
    PARTS ||--o{ SERVICE_REQUEST_PARTS : used_in
    SERVICE_REQUESTS ||--o{ SERVICE_REQUEST_PARTS : uses
    SERVICE_REQUESTS ||--o{ SERVICE_REQUEST_SERVICES : includes
    CARTYPES ||--|| VEHICLES : references

    CUSTOMERS {
        int customer_id PK
        string name
        string email UK
        string phone
        string password
        string address
        boolean email_verified
        boolean phone_verified
        timestamp created_at
        timestamp last_login
    }

    VEHICLES {
        int vehicle_id PK
        int customer_id FK
        string registration_number UK
        string brand
        string model
        int year
        string fuel_type
        string color
        int mileage
        timestamp created_at
    }

    MECHANICS {
        int mechanic_id PK
        string name
        string email UK
        string phone
        int experience_years
        string specialization
        boolean available
        decimal rating
        timestamp created_at
    }

    SERVICE_REQUESTS {
        int request_id PK
        int customer_id FK
        int vehicle_id FK
        int assigned_mechanic FK
        date request_date
        date scheduled_date
        date completion_date
        string status
        text customer_notes
        text mechanic_notes
        decimal estimated_cost
        decimal final_cost
        timestamp created_at
    }

    SERVICES {
        int service_id PK
        string name UK
        text description
        string category
        decimal base_price
        int estimated_duration
        boolean active
        timestamp created_at
    }

    PARTS {
        int part_id PK
        string part_name
        string part_code UK
        string category
        decimal price
        int stock_quantity
        int min_stock_level
        string supplier
        text description
        timestamp created_at
        timestamp updated_at
    }

    SERVICE_REQUEST_SERVICES {
        int request_id FK
        int service_id FK
    }

    SERVICE_REQUEST_PARTS {
        int request_id FK
        int part_id FK
        int quantity_used
        decimal part_cost
    }

    CARTYPES {
        int id PK
        string brand
        string model
        string variant
        int year
        string fuel_type
        string transmission
        decimal price
    }
```

### Table-to-API Endpoint Mapping

| **Table** | **API Endpoints** | **Frontend Components** |
|-----------|-------------------|-------------------------|
| `customers` | `/api/customers/*` | CustomerManagement, CustomerDashboard, Register, Login |
| `vehicles` | `/api/vehicles/*` | AddVehicle, MyVehicles, Vehicles, CarTypes |
| `mechanics` | `/api/mechanics/*` | MechanicManagement, MechanicDashboard, AssignRequests |
| `service_requests` | `/api/service-requests/*` | BookService, ServiceTracking, JobHistory, MechanicJobs |
| `services` | `/api/services/*` | Services, BookService |
| `parts` | `/api/parts/*` | PartsManagement, MechanicDashboard |
| `cartypes` | `/api/vehicles/brands/*` | CarTypes, AddVehicle |
| `service_request_services` | Embedded in service-requests API | Service booking and tracking |
| `service_request_parts` | Embedded in parts and service-requests API | Parts usage tracking |

### Data Flow Architecture

```
Frontend Components → API Routes → Database Tables
     ↓                   ↓              ↓
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Pages     │ → │   Routes    │ → │   Tables    │
├─────────────┤   ├─────────────┤   ├─────────────┤
│ Login       │ → │ /auth       │ → │ customers   │
│ Register    │ → │ /auth       │ → │ customers   │
│ CarTypes    │ → │ /vehicles   │ → │ cartypes    │
│ AddVehicle  │ → │ /vehicles   │ → │ vehicles    │
│ BookService │ → │ /service-*  │ → │ service_*   │
│ MechanicJobs│ → │ /mechanics  │ → │ mechanics   │
│ Parts Mgmt  │ → │ /parts      │ → │ parts       │
└─────────────┘   └─────────────┘   └─────────────┘
```

## 🎯 Current Features Status

✅ **Completed Features:**
- User authentication and registration with secure JWT tokens
- Role-based dashboards (Customer, Mechanic, Manager)
- Vehicle management with comprehensive car model support
- Service booking system with date selection
- Customer dashboard with vehicle overview and service tracking
- Mechanic dashboard with job management and completion history
- Manager dashboard with comprehensive business management tools
- Parts inventory management system
- **Full mobile responsiveness** across all pages and components
- **PageHeader component** with consistent back navigation
- **Mobile-optimized navigation** with slide-out menu
- **Manager Dashboard mobile layout** with optimized stat cards and tools
- Professional dark theme with blue accent colors
- Service catalog with filtering capabilities
- Enhanced navigation with improved logout functionality
- Optimized codebase with cleaned dependencies
- **Non-scrollable landing page** that fits mobile screens
- **Consistent container layouts** with proper alignment
- **Touch-optimized UI** with appropriate button sizes
- Salary payment tracking and history

🚧 **In Progress:**
- Real-time job status updates with WebSocket integration
- Advanced reporting and analytics with charts
- Payment processing integration (Razorpay/Stripe)
- Push notifications for job updates

✨ **Recently Enhanced:**
- Mobile-first responsive design (October 2025)
- Reusable PageHeader component
- Improved mobile navigation UX
- Consistent spacing and typography across devices
- Filter sections optimized for mobile
- Stats cards with responsive grid layouts

## � Security Best Practices

### Environment Variables
- **Never commit `.env` files** - They contain sensitive credentials
- **Use `.env.example`** - Template files with placeholder values are safe to commit
- **Rotate secrets regularly** - Update JWT_SECRET and API keys periodically
- **Separate credentials** - Use different credentials for development, staging, and production

### What's Protected
✅ **Already Secured:**
- `.env` files excluded in `.gitignore`
- API keys removed from source code
- Supabase credentials moved to environment variables
- JWT secrets not hardcoded
- Database passwords in environment variables only

❌ **Never Commit:**
- Actual API keys or tokens
- Database passwords
- JWT secrets
- Service role keys
- Production credentials

### How to Generate Secure Secrets
```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate multiple secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Client-Side Security
- ✅ Supabase anon key is safe for client-side (has Row Level Security)
- ❌ Never use service_role key on client-side (has admin access)
- ✅ API calls require JWT authentication
- ✅ Role-based access control on all routes

## �🔧 Code Quality & Maintenance

### Mobile-First Architecture
- **Responsive Breakpoints**: 
  - xs: 475px (phone)
  - sm: 640px (large phone/small tablet)
  - md: 768px (tablet)
  - lg: 1024px (laptop)
  - xl: 1280px (desktop)
  - 2xl: 1536px (large desktop)
- **Component Reusability**: PageHeader used across 5+ pages for consistency
- **Consistent Patterns**: 
  - Container padding: `px-3 xs:px-4 sm:px-6`
  - Vertical spacing: `py-4 sm:py-8`
  - Max width: `max-w-7xl mx-auto`
  - Card padding: `p-3 xs:p-4 sm:p-6`
- **Touch Optimization**: 
  - Minimum button height: 44px (Apple's touch target guideline)
  - Adequate spacing between interactive elements
  - Full-width buttons on mobile where appropriate

### Asset Management
- **Image Optimization**: All vehicle images in modern formats (WebP, AVIF)
- **Efficient Loading**: Optimized image loading with proper alt text and responsive sizing
- **Clean Structure**: Organized assets in logical folder structure
- **Background Images**: Optimized backgrounds with proper overlays for readability

### Security & Git Hygiene
- **Environment Variables**: All secrets in .env files (excluded from git)
- **Clean History**: Removed sensitive data from git tracking
- **File Organization**: Removed 37+ unused test/migration files
- **Dependencies**: Cleaned up duplicate and unused packages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Notes

- **Database**: All database schemas and initial data are configured for production
- **Authentication**: Uses JWT tokens with secure role-based access control
- **Styling**: Tailwind CSS with custom dark theme configuration and optimized build
- **Images**: Vehicle images are optimized and stored in modern formats (WebP/AVIF)
- **Responsive**: Mobile-first design approach with comprehensive breakpoint coverage
- **Performance**: Optimized dependencies and eliminated unused imports for faster load times
- **Security**: Comprehensive security middleware including Helmet and rate limiting
- **Code Quality**: Clean, maintainable codebase with consistent styling and structure

### Development Best Practices
- **Component Reusability**: Modular React components with consistent props and styling
  - PageHeader: Single source of truth for page headers
  - Navbar: Unified navigation across all pages
  - Consistent card and form components
- **Mobile-First Design**: All components designed for mobile first, then enhanced
- **Responsive Patterns**: Consistent breakpoint usage and spacing
- **Error Handling**: Comprehensive error handling on both frontend and backend
- **Logging**: Structured logging with Winston for better debugging and monitoring
- **Testing**: Test-ready structure with Jest configuration
- **Code Organization**: Clear separation of concerns with organized folder structure
- **Git Workflow**: Clean commits with descriptive messages
- **Security First**: Environment variables properly managed and excluded from version control

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

### Supabase Deployment (Recommended)
The application is ready for deployment with Supabase:
- **Database**: Supabase PostgreSQL (free tier includes 500MB)
- **Authentication**: Supabase Auth (built-in)
- **Storage**: Supabase Storage (for vehicle images)
- **Real-time**: Built-in real-time subscriptions
- **Hosting Options**:
  - Frontend: Vercel, Netlify
  - Backend: Vercel, Render, Railway
  
### Traditional Deployment
- Frontend: Vercel, Netlify, or similar static hosting
- Backend: Heroku, Digital Ocean, or similar Node.js hosting
- Database: PostgreSQL hosting service (AWS RDS, Digital Ocean)

### Quick Deploy with Supabase
1. Set up Supabase project (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
2. Deploy backend to Vercel/Render with Supabase connection
3. Deploy frontend to Vercel/Netlify
4. Update environment variables in hosting platforms
5. Done! Your app is live with authentication, database, and real-time features

## 📞 Support

For support and questions, please contact the development team or create an issue in the GitHub repository.

---

**Built with ❤️ by the Garage360 Team**
