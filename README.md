# FullStack E-Commerce App

Complete full-stack e-commerce application with React Native mobile app and .NET Core Web API backend.

## 🚀 Features

### Mobile App (React Native/Expo)
- **Authentication**: Login & Register with JWT
- **Product Management**: Dynamic product listings with API integration
- **Category & Size Management**: API-driven categorization with dynamic size options
- **Search & Filter**: Advanced filtering with category, size, and price filters
- **Shopping Cart**: Add, remove, and manage products
- **Favorites**: Save favorite products
- **Multi-language Support**: Turkish and English
- **Dark/Light Theme**: Theme switching capability
- **Offline Support**: Fallback data when API is unavailable

### Backend API (.NET 8)
- **Authentication**: JWT-based authentication system
- **Category Management**: Full CRUD operations for categories
- **Size Management**: Dynamic size management per category
- **Database**: Entity Framework Core with SQL Server
- **API Documentation**: RESTful API endpoints
- **Seed Data**: Automatic database seeding

## 📱 Screens

- **Home**: Product listings with Fast Delivery, Flash Sale, and Best Selling sections
- **Search**: Advanced product search with filtering
- **Filter**: Category and size filtering with price range
- **Product Detail**: Detailed product view with size selection
- **Cart**: Shopping cart management
- **Favorites**: Favorite products management
- **Account**: User profile and settings
- **Authentication**: Login and registration

## 🛠 Tech Stack

### Frontend (Mobile)
- React Native with Expo
- React Navigation
- Context API for state management
- AsyncStorage for local storage
- Axios for HTTP requests
- Expo Vector Icons

### Backend
- .NET 8 Web API
- Entity Framework Core
- SQL Server Database
- JWT Authentication
- AutoMapper (if used)

## 🏗 Project Structure

```
FullStack_ECommerceApp/
├── e-ticaret/                 # React Native App
│   ├── screens/              # App screens
│   ├── components/           # Reusable components
│   ├── contexts/             # Context providers
│   ├── utils/                # Utility functions and API calls
│   └── assets/               # Images, fonts, icons
├── mobileAPI/                # .NET Web API
│   ├── Controllers/          # API controllers
│   ├── Models/               # Data models
│   ├── Data/                 # Database context
│   ├── Services/             # Business logic
│   └── Migrations/           # Database migrations
└── README.md
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Categories
- `GET /api/categories` - Get all categories with sizes
- `POST /api/categories` - Create new category
- `DELETE /api/categories/{id}` - Delete category
- `POST /api/categories/seed` - Seed default categories

### Sizes
- `GET /api/categories/{categoryId}/sizes` - Get sizes for category
- `POST /api/categories/{categoryId}/sizes` - Add size to category

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- .NET 8 SDK
- SQL Server or SQL Server Express
- Expo CLI (`npm install -g @expo/cli`)

### Backend Setup
1. Navigate to the API directory:
   ```bash
   cd mobileAPI
   ```

2. Restore packages:
   ```bash
   dotnet restore
   ```

3. Update database connection string in `appsettings.json`

4. Run migrations:
   ```bash
   dotnet ef database update
   ```

5. Start the API:
   ```bash
   dotnet run
   ```

The API will be available at `http://localhost:5207`

### Mobile App Setup
1. Navigate to the React Native directory:
   ```bash
   cd e-ticaret
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API base URL in `utils/productUtils.js` if needed

4. Start Expo:
   ```bash
   npx expo start
   ```

## 🔧 Configuration

### API Configuration
- Update `appsettings.json` for database connection
- Configure JWT settings in `appsettings.json`
- Update CORS settings if needed

### Mobile App Configuration
- Update API base URL in `utils/categoryApi.js`
- Configure app settings in `app.json`

## 📝 Features Implemented

- ✅ User Authentication (Login/Register)
- ✅ Category Management with API
- ✅ Dynamic Size Management
- ✅ Product Search and Filtering
- ✅ Shopping Cart Functionality
- ✅ Favorites Management
- ✅ Multi-language Support
- ✅ Theme Management
- ✅ Offline Support with Fallbacks
- ✅ API Status Indicators
- ✅ Error Handling and Recovery

## 🧪 Testing

### API Testing
- Use Postman or similar tools
- Test endpoints with `mobileAPI.http` file
- Verify JWT authentication

### Mobile App Testing
- Test on iOS and Android devices/simulators
- Verify offline functionality
- Test API connectivity indicators

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational and development purposes.

## 🆘 Troubleshooting

### Common Issues
1. **API Connection**: Verify the API URL and ensure the backend is running
2. **Database Issues**: Check connection string and run migrations
3. **Build Issues**: Clear cache and reinstall dependencies
4. **Authentication**: Verify JWT configuration

### Error Handling
- The app includes comprehensive error handling
- Fallback data is provided when API is unavailable
- User-friendly error messages are displayed

## 📞 Support

For issues and questions, please create an issue in the repository.

---

**Last Updated**: July 13, 2025
**Version**: 1.0.0
