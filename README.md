# oneBE - Backend API

A production-grade Node.js/Express backend with TypeScript, featuring comprehensive authentication, security, and error handling.

## Features

- 🔐 Complete Authentication System
  - Local authentication with JWT
  - Social auth (Google, Facebook)
  - Refresh token rotation
  - Secure cookie handling

- 🛡️ Security Features
  - Rate limiting
  - Helmet security headers
  - CORS configuration
  - Input validation

- 📝 Error Handling & Logging
  - Centralized error handling
  - Winston logger integration
  - Structured error responses

- 🔄 API Features
  - RESTful API design
  - API versioning
  - Swagger documentation
  - Request validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- TypeScript

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd oneBE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FB_CLIENT_ID=your_facebook_client_id
FB_CLIENT_SECRET=your_facebook_client_secret
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm test`: Run tests

## Project Structure

```
src/
├── config/         # Configuration files
├── modules/        # Feature modules
├── middleware/     # Custom middleware
├── types/          # TypeScript types
├── utils/          # Utility functions
└── tests/          # Test files
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 