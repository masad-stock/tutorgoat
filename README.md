# TutorGoat - Anonymous Tutoring Service

A dynamic, web-based tutoring service that provides complete anonymity and guaranteed A or B grade results for Computer Science, IT, Business, Programming, Web & App Development, and Statistics assignments.

## 🚀 Features

### Core Features

- **Complete Anonymity**: No user accounts, profiles, or personal data stored
- **A or B Grade Guarantee**: Full refund if grade guarantee not met
- **Dynamic Website**: Interactive elements with smooth animations
- **Secure Form Processing**: Protected inquiry submission with file uploads
- **Email-Based Communication**: Quote delivery via secure email system
- **Responsive Design**: Works perfectly on all devices

### Dynamic Elements

- Rotating hero headlines
- Animated pricing cards
- Interactive inquiry form with real-time validation
- Dynamic testimonials carousel
- Animated "How It Works" section
- Collapsible FAQ section
- File drag-and-drop upload with progress indication

## 🛠️ Technology Stack

### Frontend

- **React.js** - Dynamic user interface
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Form validation and management
- **React Dropzone** - File upload functionality
- **Axios** - HTTP client for API communication
- **React Icons** - Icon library

### Backend

- **Node.js** - Server runtime
- **Express.js** - Web framework
- **MongoDB** - Database for anonymous submissions
- **Mongoose** - MongoDB object modeling
- **Nodemailer** - Email service integration
- **Multer** - File upload handling

### Security & Performance

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **Input Validation** - Data sanitization
- **File Type Validation** - Secure uploads

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Email service account (Gmail, SendGrid, etc.)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tutorgoat
   ```

2. **Install dependencies**

   ```bash
   npm run install-all
   ```

3. **Environment Configuration**

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/tutorgoat

   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@tutorgoat.com
   INTERNAL_EMAIL=admin@tutorgoat.com
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers.

## 🏗️ Project Structure

```
tutorgoat/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── sections/   # Page sections
│   │   │   └── ...
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Email services
│   └── index.js
├── uploads/               # File uploads directory
├── package.json
└── README.md
```

## 🔧 API Endpoints

### POST /api/inquiry

Submit a new tutoring inquiry.

**Request Body:**

```json
{
  "courseName": "Python Programming",
  "assignmentDetails": "Create a web scraper...",
  "contactEmail": "student@example.com",
  "serviceType": "assignment",
  "urgency": "normal"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Inquiry submitted successfully!",
  "inquiryId": "TG-1234567890-ABC123"
}
```

### GET /api/inquiry/:inquiryId

Get inquiry status (for internal use).

## 🎨 Customization

### Styling

- Modify `client/src/App.css` for global styles
- Update `client/src/index.css` for base styles
- Customize component styles in individual files

### Content

- Update testimonials in `TestimonialsSection.js`
- Modify FAQ content in `FAQSection.js`
- Change pricing in `PricingSection.js`

### Email Templates

- Customize email templates in `server/services/emailService.js`
- Update email styling and content as needed

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tutorgoat
EMAIL_SERVICE=gmail
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
INTERNAL_EMAIL=admin@yourdomain.com
```

### Recommended Hosting Platforms

- **Frontend**: Vercel, Netlify, or AWS S3
- **Backend**: Heroku, AWS EC2, or DigitalOcean
- **Database**: MongoDB Atlas
- **Email**: SendGrid, Mailgun, or AWS SES

## 🔒 Security Features

- **HTTPS/SSL**: Mandatory for all traffic
- **Rate Limiting**: Prevents API abuse
- **Input Sanitization**: Protects against injection attacks
- **File Type Validation**: Secure file uploads
- **CORS Protection**: Controlled cross-origin access
- **Helmet Security**: Security headers

## 📱 Responsive Design

The website is fully responsive and optimized for:

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:

- Email: admin@tutorgoat.com
- Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Dynamic homepage with animations
  - Secure inquiry form with file uploads
  - Email-based communication system
  - Complete anonymity features
  - A or B grade guarantee system

---

**Disclaimer**: This service is designed for educational assistance. Students are responsible for understanding and complying with their institution's academic integrity policies.
