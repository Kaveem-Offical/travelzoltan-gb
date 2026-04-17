# ZoltanVisa - Worldwide Visa Assistance Platform

A full-stack MERN application for visa assistance and travel booking services. This platform provides a seamless experience for travelers to apply for visas, check requirements, and manage their travel documentation.

## 🎨 Design

- **Primary Color**: #FF3366 (Pink/Red)
- **Design System**: Material Design 3 inspired
- **Typography**: Plus Jakarta Sans (Headlines) & Inter (Body)
- **UI Framework**: Tailwind CSS with custom configuration

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Sequelize** - ORM for database
- **MySQL** - Database
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
zoltan-travels/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middlewares
│   ├── migrations/       # Database migrations
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── uploads/          # File uploads directory
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── sample.html           # Original design reference
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd zoltan-travels
```

### 2. Database Setup

Create a MySQL database:
```sql
CREATE DATABASE visa_platform;
```

### 3. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=visa_platform
DB_DIALECT=mysql
```

Run database migrations:
```bash
npm run db:migrate
```

Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:5001`

### 4. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5001/api
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📡 API Endpoints

### Public Endpoints

#### Get Visa Requirements
```http
GET /api/visa-requirements?citizenship=<citizenship>&destination=<destination>
```

**Response:**
```json
{
  "service_fee": 133.00,
  "required_documents": [...],
  "form_schema": {...},
  "configuration_id": 1
}
```

#### Create Application
```http
POST /api/applications
Content-Type: multipart/form-data

{
  "configuration_id": 1,
  "user_data": "{...}",
  "documents": [files]
}
```

**Response:**
```json
{
  "message": "Application created successfully",
  "applicationId": 1
}
```

#### Create Payment Intent
```http
POST /api/payments/create-intent

{
  "applicationId": 1
}
```

**Response:**
```json
{
  "message": "Payment processed successfully",
  "applicationId": 1,
  "status": "completed"
}
```

### Admin Endpoints

All admin endpoints require authentication (mock implementation).

#### Get All Applications
```http
GET /api/admin/applications
```

#### Get All Configurations
```http
GET /api/admin/configurations
```

#### Update Configuration
```http
PUT /api/admin/configurations/:id

{
  "service_fee": 150.00,
  "required_documents": [...],
  "form_schema": {...}
}
```

## 🎯 Features

### User Features
- ✅ Browse visa requirements by citizenship and destination
- ✅ View detailed document checklists
- ✅ Submit visa applications with file uploads
- ✅ Real-time form validation
- ✅ Payment processing integration
- ✅ Responsive design for all devices
- ✅ Modern, intuitive UI

### Admin Features
- ✅ View all applications
- ✅ Manage visa configurations
- ✅ Update service fees and requirements

## 🎨 Design Features

- **Material Design 3** inspired color system
- **Smooth animations** and transitions
- **Glass morphism** effects
- **Editorial shadows** for depth
- **Asymmetric layouts** for visual interest
- **Responsive grid** system
- **Dark mode** support (configured)

## 🔧 Development

### Client Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Server Scripts
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm run db:migrate  # Run database migrations
```

## 📦 Database Models

### VisaConfiguration
- citizenship (STRING)
- destination (STRING)
- service_fee (DECIMAL)
- required_documents (JSON)
- form_schema (JSON)

### Application
- configuration_id (INTEGER, FK)
- user_data (JSON)
- document_urls (JSON)
- payment_status (ENUM: pending, completed, failed)

## 🔐 Security Features

- CORS configuration for allowed origins
- File upload validation
- Input sanitization
- Environment variable protection
- SQL injection prevention (Sequelize ORM)

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the client: `npm run build`
2. Deploy the `dist` folder
3. Set environment variable: `VITE_API_URL`

### Backend Deployment (Heroku/Railway)
1. Set environment variables
2. Run migrations: `npm run db:migrate`
3. Start server: `npm start`

## 📝 Environment Variables

### Client (.env)
```env
VITE_API_URL=http://localhost:5001/api
```

### Server (.env)
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=visa_platform
DB_DIALECT=mysql
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Development Team**: ZoltanVisa
- **Design**: Based on sample.html reference

## 📞 Support

For support or inquiries:
- Email: support@zoltanvisa.com
- Phone: +44 20 1234 5678
- WhatsApp: Available 24/7

## 🎉 Acknowledgments

- Design inspiration from Material Design 3
- Icons from Google Material Symbols
- Fonts from Google Fonts
- Images from Unsplash

---

**Built with ❤️ by the ZoltanVisa Team**
