# ZoltanVisa - Quick Setup Guide

This guide will help you get the ZoltanVisa platform up and running in minutes.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js (v16 or higher) - [Download](https://nodejs.org/)
- [ ] MySQL (v8 or higher) - [Download](https://dev.mysql.com/downloads/)
- [ ] npm (comes with Node.js)
- [ ] Git (optional, for cloning)

## 🚀 Quick Start (5 Minutes)

### Step 1: Database Setup (2 minutes)

1. Open MySQL command line or MySQL Workbench
2. Create the database:
```sql
CREATE DATABASE visa_platform;
```

3. Verify the database was created:
```sql
SHOW DATABASES;
```

### Step 2: Backend Configuration (1 minute)

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the `server` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=visa_platform
DB_DIALECT=mysql
```

**Important**: Replace `your_mysql_password` with your actual MySQL password!

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the backend server:
```bash
npm run dev
```

You should see:
```
Database connection has been established successfully.
Server is running on port 5000
```

### Step 3: Frontend Configuration (2 minutes)

1. Open a new terminal and navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm run dev
```

You should see:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

🎉 **Congratulations!** Your ZoltanVisa platform is now running!

## 🧪 Testing the Application

### Test the Homepage
1. Visit `http://localhost:3000`
2. You should see the hero section with destination selector
3. Select "United Kingdom" as citizenship
4. Select "Europe (Schengen States)" as destination
5. Click "Check Details"

### Test the Application Form
1. You should be redirected to the checklist page
2. Fill in the form:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: +44 20 1234 5678
   - Passport Number: AB1234567
3. Upload some test documents (PDF or images)
4. Check the terms checkbox
5. Click "Submit Application"
6. You should see a success message!

### Verify Backend
1. Check the server terminal - you should see API requests being logged
2. Visit `http://localhost:5000` - you should see:
```json
{"message": "Visa Booking Platform API is running!"}
```

## 🔧 Troubleshooting

### Database Connection Error
**Error**: `Unable to connect to the database`

**Solution**:
1. Verify MySQL is running
2. Check your `.env` credentials
3. Ensure the database exists: `SHOW DATABASES;`
4. Test connection: `mysql -u root -p`

### Port Already in Use
**Error**: `Port 5000 is already in use`

**Solution**:
1. Change the port in `server/.env`:
```env
PORT=5001
```
2. Update `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
```

### Module Not Found
**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# In the affected directory (client or server)
rm -rf node_modules package-lock.json
npm install
```

### CORS Error
**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution**:
1. Verify the server is running on port 5000
2. Check `server/server.js` has correct CORS configuration
3. Restart both servers

## 📦 Seeding Sample Data (Optional)

To add sample visa configurations:

1. Create a file `server/seeders/seed-visa-configs.js`:
```javascript
const { VisaConfiguration } = require('../models');

const seedData = async () => {
  await VisaConfiguration.bulkCreate([
    {
      citizenship: 'United Kingdom',
      destination: 'Europe (Schengen States)',
      service_fee: 133.00,
      required_documents: [
        { title: 'Original Passport', icon: 'travel', color: 'text-primary', border: 'border-primary', desc: 'Must be valid for 6 months beyond departure date.' },
        { title: 'Biometric Photos', icon: 'photo_camera', color: 'text-secondary', border: 'border-secondary', desc: 'Two recent color photos (3.5 x 4.5 cm) on white background.' },
        { title: 'Travel Insurance', icon: 'description', color: 'text-tertiary', border: 'border-tertiary', desc: 'Proof of medical insurance covering €30,000 min.' },
        { title: 'Proof of Residency', icon: 'home_work', color: 'text-primary-container', border: 'border-primary-container', desc: 'Valid UK residence permit (BRP) or equivalent.' }
      ],
      form_schema: {}
    }
  ]);
  console.log('Sample data seeded successfully!');
};

seedData();
```

2. Run the seeder:
```bash
node server/seeders/seed-visa-configs.js
```

## 🎯 Next Steps

Now that your application is running:

1. **Explore the UI**: Navigate through the homepage and checklist page
2. **Test the API**: Use Postman or curl to test API endpoints
3. **Customize**: Update colors, content, and features
4. **Add Features**: Implement authentication, admin panel, etc.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Guide](https://vitejs.dev/)

## 🆘 Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs in both terminal windows
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
5. Check that MySQL is running

## 🎉 Success Checklist

- [ ] MySQL database created
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Can access homepage at http://localhost:3000
- [ ] Can navigate to checklist page
- [ ] Can submit application form
- [ ] API requests working (check browser console)

---

**Happy Coding! 🚀**
