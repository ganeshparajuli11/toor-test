# TOOR - Travel & Tourism Platform

A modern, fully responsive signup page built with React, featuring SEO optimization, smooth animations, and centralized API configuration.

## 🚀 Features

### Core Functionality
- ✅ **Fully Responsive Design** - Mobile-first approach with breakpoints for all devices
- ✅ **Form Validation** - React Hook Form with comprehensive validation rules
- ✅ **Image Carousel** - Auto-rotating carousel with manual navigation
- ✅ **Social Login** - Facebook and Google OAuth integration ready
- ✅ **Toast Notifications** - User-friendly success/error messages
- ✅ **SEO Optimized** - Meta tags, Open Graph, and Twitter Card support
- ✅ **Smooth Animations** - CSS transitions and keyframe animations
- ✅ **Dark Navigation** - Sticky header with mobile menu support

### Architecture & Code Quality
- 📁 **Component-Based** - Reusable Input, Button, Header, Footer components
- 🎨 **Design System** - Centralized color palette and typography
- 🔌 **API Configuration** - Single file for all API endpoints
- 🎯 **Type-Safe Forms** - Validation with error messages
- ♿ **Accessibility** - ARIA labels and semantic HTML
- ⚡ **Performance** - Optimized images and lazy loading

## 📦 Installed Libraries

### Core Dependencies
- `react` (v19.1.1) - UI library
- `react-router-dom` (v7.9.5) - Client-side routing
- `react-hook-form` (v7.66.0) - Form validation
- `react-hot-toast` (v2.6.0) - Toast notifications
- `axios` (v1.13.1) - HTTP client for API calls
- `zustand` (v5.0.8) - State management
- `lucide-react` (v0.552.0) - Icon library (1000+ icons)
- `tailwindcss` (v4.1.16) - Utility-first CSS framework
- `date-fns` (v4.1.0) - Date utilities
- `clsx` (v2.1.1) - Conditional classNames

## 🎨 Design System

All design tokens are defined in `src/styles/design-system.css`:

### Color Palette
- Primary: `#00bcd4` (Cyan Blue)
- Dark: `#2c3e50` (Navigation/Footer)
- Text: `#2c3e50`, `#7f8c8d` (Primary/Secondary)
- Social: Facebook `#1877f2`, Google colors

### Typography
- Font Family: Inter, System UI fallback
- Font Sizes: 12px - 36px (responsive scale)
- Font Weights: 300 - 700

### Spacing & Layout
- Consistent spacing scale (4px - 64px)
- Border radius: 4px - 16px
- Box shadows: sm, md, lg, xl

## 🔌 API Configuration

### Setup
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the API URL:
   ```env
   VITE_API_BASE_URL=https://your-api.com
   ```

### Configuration File
All API endpoints are defined in `src/config/api.js`:

```javascript
export const API_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  GOOGLE_AUTH: '/auth/google',
  FACEBOOK_AUTH: '/auth/facebook',
  // ... more endpoints
};
```

### Usage in Components
```javascript
import { API_ENDPOINTS, getApiUrl } from '../config/api';
import axios from 'axios';

// Make API call
const response = await axios.post(getApiUrl(API_ENDPOINTS.SIGNUP), data);
```

## 🎯 Form Validation Rules

The signup form includes comprehensive validation:

- **First Name**: Required, min 2 characters
- **Last Name**: Required, min 2 characters
- **Email**: Required, valid email format
- **Phone Number**: Required, valid phone format
- **Password**: Required, min 8 characters, must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Terms**: Must be checked before submission

## 🧩 Components

### Reusable Components

#### Input Component
```jsx
<Input
  label="Email address"
  type="email"
  placeholder="Enter email"
  error={errors.email?.message}
  icon={<Icon />}
  {...register('email')}
/>
```

#### Button Component
```jsx
<Button
  variant="primary" // primary, secondary, outline, social
  size="md" // sm, md, lg
  fullWidth
  loading={isLoading}
  icon={<Icon />}
>
  Sign Up
</Button>
```

#### SEO Component
```jsx
<SEO
  title="Page Title"
  description="Page description"
  keywords="keyword1, keyword2"
  canonical="https://example.com/page"
/>
```

## 📂 Project Structure

```
src/
├── config/
│   └── api.js                 # API configuration
├── styles/
│   └── design-system.css      # Design tokens
├── components/
│   ├── Header.jsx/css         # Navigation header
│   ├── Footer.jsx/css         # Footer with links
│   ├── Input.jsx/css          # Form input
│   ├── Button.jsx/css         # Button component
│   ├── ImageCarousel.jsx/css  # Image slider
│   └── SEO.jsx                # SEO meta tags
├── pages/
│   └── SignUp.jsx/css         # Signup page
├── App.jsx                    # App routes
└── main.jsx                   # App entry point
```

## 🚀 Getting Started

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Configure API**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

## 🎨 Customization

### Update Colors
Edit `src/styles/design-system.css`:
```css
:root {
  --color-primary: #00bcd4; /* Change primary color */
  --color-dark: #2c3e50;    /* Change dark color */
}
```

### Update API Endpoints
Edit `src/config/api.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-api.com',
  VERSION: 'v1',
};
```

### Add New Routes
Edit `src/App.jsx`:
```jsx
<Route path="/new-page" element={<NewPage />} />
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## ♿ Accessibility

- Semantic HTML5 elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast WCAG AA compliant

## 🔒 Security Features

- Password strength validation
- XSS protection (React default)
- CSRF token support ready
- Secure password field
- Terms agreement required

## 🎭 Animations

All animations use CSS transitions with smooth easing:
- Fade in effects on page load
- Hover effects on buttons/links
- Smooth carousel transitions
- Mobile menu slide animation

## 📊 SEO Features

- Dynamic meta tags
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs
- Structured semantic HTML
- Optimized page titles and descriptions

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Next Steps

1. **Implement Backend API**:
   - Create signup endpoint at `/api/v1/auth/signup`
   - Return proper success/error responses
   - Handle social OAuth callbacks

2. **Add More Pages**:
   - Login page
   - Forgot password
   - Dashboard
   - User profile

3. **Enhance Features**:
   - Email verification
   - Two-factor authentication
   - Password strength indicator
   - Profile picture upload

4. **Testing**:
   - Add unit tests (Jest/Vitest)
   - Add E2E tests (Cypress/Playwright)
   - Test form validations
   - Test API integrations

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Styling Issues
```bash
# Ensure Tailwind is properly configured
# Check tailwind.config.js and postcss.config.js
```

## 📄 License

This project is built with React and Vite. Feel free to use and modify as needed.

## 🤝 Contributing

This is a starter template. Customize it according to your needs!

---

**Built with ❤️ using React, TailwindCSS, and modern web technologies**

Server running at: http://localhost:5174/
