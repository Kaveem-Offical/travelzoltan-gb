# ZoltanVisa - Client Application

A modern React application for visa assistance and travel booking services, built with Vite, React Router, and Tailwind CSS.

## Features

- 🎨 Modern UI with Tailwind CSS and custom color scheme (#FF3366 primary)
- 🚀 Fast development with Vite
- 🔄 React Router for seamless navigation
- 📡 Axios for API integration
- 📱 Fully responsive design
- 🎭 Material Symbols icons
- ✨ Smooth animations and transitions

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Google Fonts** - Plus Jakarta Sans & Inter

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
client/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── TopNavBar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   └── ChecklistPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── index.html
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

## API Integration

The application connects to the backend API at `http://localhost:5000/api` by default. The following endpoints are used:

- `GET /api/visa-requirements` - Fetch visa requirements
- `POST /api/applications` - Submit visa application
- `POST /api/payments/create-intent` - Process payment

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: http://localhost:5000/api)

## Design System

### Colors

- **Primary**: #FF3366 (Pink/Red)
- **Secondary**: #b60e3d
- **Tertiary**: #394e79
- **Surface**: #f7f9fb
- **Background**: #f7f9fb

### Typography

- **Headlines**: Plus Jakarta Sans
- **Body**: Inter
- **Labels**: Inter

### Border Radius

- Default: 1rem
- Large: 2rem
- Extra Large: 3rem
- Full: 9999px

## Features

### Home Page
- Hero section with destination selector
- Trust badges and statistics
- Services showcase
- Featured destinations gallery

### Checklist Page
- Dynamic visa requirements loading
- Document checklist display
- Application form with file upload
- Real-time form validation
- Payment integration
- Support sidebar

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Contact

For support or inquiries, please contact the development team.
