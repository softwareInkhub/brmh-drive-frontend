# 🚀 BRMH Drive

A modern, enterprise-grade file management system built with Next.js, TypeScript, and Tailwind CSS. BRMH Drive provides a Google Drive-like experience with SSO authentication, tab-based navigation, and seamless backend integration.

![BRMH Drive](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react)

## ✨ Features

### 🎯 Core Functionality
- **File Management**: Upload, download, rename, move, delete files and folders
- **Folder Operations**: Create folders, navigate hierarchy, bulk operations
- **File Preview**: Preview documents, images, and media files
- **File Sharing**: Share files and folders with permission controls
- **Search**: Global search across all files and folders
- **Quick Access**: Recently accessed, starred, and shared items
- **Storage Monitoring**: Real-time storage usage tracking
- **Trash**: Soft delete with restore functionality

### 🎨 User Interface
- **Tab-Based Navigation**: Multi-tab browsing like modern browsers with persistent state
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Toggle between light and dark modes
- **Grid & List Views**: Switch between grid and list view modes
- **Sorting Options**: Sort by name, date, size, or type
- **Drag & Drop**: Upload files by dragging and dropping anywhere
- **Breadcrumb Navigation**: Easy navigation through folder hierarchy

### 🔧 Advanced Features
- **SSO Authentication**: Integrated with auth.brmh.in for secure authentication
- **Command Palette**: Quick access to actions with keyboard shortcuts (Cmd+K / Ctrl+K)
- **Context Menus**: Right-click actions for files and folders
- **Multi-select**: Select multiple items for batch operations
- **State Persistence**: UI preferences and tabs persist across sessions
- **Backend Integration**: Full REST API integration with BRMH Drive backend
- **Real-time Updates**: TanStack Query for efficient data fetching and caching
- **Mobile-First**: Fully responsive with mobile-optimized interactions

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5** - React framework with App Router and Turbopack
- **React 19.1** - Latest React with improved performance
- **TypeScript 5.0+** - Type-safe JavaScript
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library based on Radix UI
- **Lucide React** - Beautiful icon library
- **next-themes** - Dark mode support

### State Management & Data
- **Zustand 5.0** - Lightweight state management with persistence
- **TanStack Query 5.0** - Server state management, caching, and data fetching
- **React Dropzone** - Drag and drop file uploads

### Backend Integration
- **BRMH Drive API** - RESTful API for file operations
- **SSO Authentication** - Centralized authentication via auth.brmh.in
- **FormData Upload** - Efficient multipart file uploads (up to 100MB)

### Development Tools
- **ESLint 9** - Code linting with Next.js configuration
- **Jest** - Testing framework
- **Testing Library** - React component testing
- **TanStack Query DevTools** - Development debugging tools

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (20+ recommended)
- **npm** or **yarn**
- **BRMH Drive Backend** - Running on `http://localhost:5001` (see Backend Setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd brmh-drive-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # Backend API Base URL
   NEXT_PUBLIC_DRIVE_API_BASE_URL=http://localhost:5001
   
   # Optional: Enable React Query DevTools in production
   # NEXT_PUBLIC_DEVTOOLS=true
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will start with **Turbopack** for faster builds and hot reloading.

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🔌 Backend Integration

### Backend API Endpoints

The frontend connects to the BRMH Drive backend for all file operations:

**Base URL**: `http://localhost:5001` (development) or `/api/drive` (production)

#### File Operations
- `POST /upload` - Upload files (multipart/form-data)
- `GET /files/{userId}?parentId={id}` - Get files in folder
- `GET /file/{userId}/{fileId}` - Get file details
- `PATCH /rename/{userId}/{fileId}` - Rename file
- `PATCH /move/file/{userId}/{fileId}` - Move file
- `DELETE /file/{userId}/{fileId}` - Delete file
- `GET /download/{userId}/{fileId}` - Download file
- `GET /preview/{userId}/{fileId}` - Preview file

#### Folder Operations
- `POST /folder` - Create folder
- `GET /folders/{userId}?parentId={id}` - Get folders
- `GET /folder/{userId}/{folderId}` - Get folder details
- `GET /contents/{userId}/{folderId}` - Get folder contents
- `PATCH /rename/folder/{userId}/{folderId}` - Rename folder
- `PATCH /move/folder/{userId}/{folderId}` - Move folder
- `DELETE /folder/{userId}/{folderId}` - Delete folder

#### Sharing Operations
- `POST /share/file/{userId}/{fileId}` - Share file
- `POST /share/folder/{userId}/{folderId}` - Share folder
- `GET /shared/with-me/{userId}` - Get shared with me
- `GET /shared/by-me/{userId}` - Get shared by me
- `PATCH /share/{userId}/{shareId}/permissions` - Update permissions
- `POST /share/{userId}/{shareId}/revoke` - Revoke share

### Authentication

The app uses **SSO authentication** via `auth.brmh.in`:

- **Development**: Tokens stored in `localStorage`
- **Production**: Tokens managed via HTTP-only cookies on `.brmh.in` domain
- **Token Types**: Access token, ID token, Refresh token
- **Auto-refresh**: Tokens refresh automatically when expired
- **Protected Routes**: All routes require authentication via `AuthGuard`

## 📁 Project Structure

```
brmh-drive-frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API proxy routes
│   ├── folder/[id]/       # Dynamic folder pages
│   ├── preview/[id]/      # File preview pages
│   ├── recent/            # Recent files page
│   ├── starred/           # Starred files page
│   ├── shared/            # Shared files page
│   ├── trash/             # Trash page
│   ├── settings/          # Settings page
│   ├── search/            # Search results page
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/            # Layout components
│   │   ├── main-layout.tsx      # Main app layout
│   │   ├── sidebar.tsx          # Navigation sidebar
│   │   └── topbar.tsx           # Top navigation bar
│   ├── ui/                # UI components (shadcn/ui based)
│   │   ├── upload-modal.tsx     # File upload interface
│   │   ├── upload-dropzone.tsx  # Drag & drop zone
│   │   ├── folder-card.tsx      # Folder display card
│   │   ├── file-tile.tsx        # File display tile
│   │   └── ...                  # Other UI components
│   └── AuthGuard.tsx      # Authentication guard
├── lib/                   # Core utilities and configurations
│   ├── api-client.ts      # Drive API client with typed methods
│   ├── config.ts          # API endpoints configuration
│   ├── drive-types.ts     # TypeScript types for Drive API
│   ├── store-client.ts    # Zustand store (UI state, tabs)
│   ├── auth-context.tsx   # Authentication context
│   ├── sso-utils.ts       # SSO authentication utilities
│   ├── use-drive.ts       # React Query hooks for Drive API
│   ├── use-tab-navigation.ts # Tab navigation logic
│   └── sorting.ts         # File/folder sorting utilities
├── public/                # Static assets
├── middleware.ts          # Next.js middleware (auth, routing)
├── .env.local             # Environment variables (create from env.example)
├── env.example            # Environment variables template
└── CORS_TROUBLESHOOTING.md # CORS and backend setup guide
```

## 🎨 Key Features Deep Dive

### Tab Navigation System
- **Multi-tab Support**: Browse multiple folders simultaneously
- **Persistent Tabs**: Tab state persists across browser sessions
- **Smart Tab Management**: Automatically prevents duplicate tabs
- **Tab Actions**: Pin, close, close others, close all
- **Search Integration**: Search results open in current tab

### State Management
- **Zustand Store**: Lightweight global state
- **Persistent State**: View mode, tabs, and preferences persist
- **Optimistic Updates**: Instant UI feedback
- **Cache Management**: TanStack Query handles server state

### File Upload System
- **Multiple Methods**: 
  - Click to browse and select files
  - Drag and drop files anywhere in the app
  - Paste images directly (coming soon)
- **Upload Progress**: Real-time progress indicators
- **Size Limits**: Up to 100MB per file (configurable)
- **Format**: Multipart/form-data for efficient uploads
- **Error Handling**: Clear error messages and retry logic

### UI Components

**Layout Components**
- `MainLayout` - Main application wrapper with sidebar and content
- `Sidebar` - Collapsible navigation sidebar
- `Topbar` - Search, view controls, and user menu
- `TabBar` - Browser-like tab navigation
- `Breadcrumbs` - Folder hierarchy navigation

**File/Folder Components**
- `FolderCard` - Grid view folder display
- `FileTile` - Grid view file display with preview
- `FileTable` - List view with sortable columns
- `ContextMenu` - Right-click actions menu

**Dialogs & Modals**
- `UploadModal` - File upload and folder creation
- `UploadDropzone` - Drag and drop zone
- `GlobalUploadDropzone` - App-wide drop target
- `CommandMenu` - Keyboard shortcuts (⌘K / Ctrl+K)
- `UserProfileDropdown` - User menu and logout

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API Configuration
NEXT_PUBLIC_DRIVE_API_BASE_URL=http://localhost:5001

# For production deployment:
# NEXT_PUBLIC_DRIVE_API_BASE_URL=https://brmh.in

# Optional: Enable React Query DevTools in production
# NEXT_PUBLIC_DEVTOOLS=true

# Optional: API Base URL for SSO
# NEXT_PUBLIC_API_BASE_URL=https://brmh.in
```

### API Client Configuration

The API client (`lib/api-client.ts`) automatically handles:
- **Authentication**: Bearer token from cookies or localStorage
- **CORS**: Proper headers and credentials
- **Error Handling**: Typed error responses
- **Request/Response Transformation**: JSON serialization
- **File Uploads**: FormData for multipart uploads

### Customization

**Tailwind Configuration** (`tailwind.config.js`):
- Custom color schemes for light/dark modes
- Responsive breakpoints
- Custom animations
- shadcn/ui theme integration

**Query Client Configuration** (`app/layout.tsx`):
- Default stale time: 5 minutes
- Cache time: 10 minutes
- Retry logic for failed requests
- Optimistic updates enabled

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Collapsible sidebar
- Touch-friendly interactions
- Optimized search experience
- Responsive grid layouts

## 🧪 Testing

The project includes a comprehensive testing setup:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- **Component Tests**: Test individual UI components
- **Integration Tests**: Test component interactions
- **API Tests**: Test API route handlers

## 🚀 Deployment

### Vercel (Recommended)

1. **Push your code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   ```env
   NEXT_PUBLIC_DRIVE_API_BASE_URL=https://your-backend-api.com
   NEXT_PUBLIC_API_BASE_URL=https://brmh.in
   ```

4. **Deploy**
   - Vercel will automatically detect Next.js
   - Deploy with a single click

### Production Checklist

Before deploying to production:

- [ ] Set `NEXT_PUBLIC_DRIVE_API_BASE_URL` to production backend URL
- [ ] Configure CORS on backend to allow frontend domain
- [ ] Set up SSO authentication domain (`.brmh.in` cookies)
- [ ] Test file upload limits (default: 100MB)
- [ ] Enable HTTPS for secure authentication
- [ ] Configure CDN for static assets (optional)
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Test authentication flow end-to-end

### Other Platforms

The project can be deployed to any platform that supports Next.js 15+:

**Cloud Platforms**
- **Netlify** - Configure build command: `npm run build`
- **AWS Amplify** - Supports Next.js SSR
- **Railway** - One-click deployment
- **DigitalOcean App Platform** - Container-based deployment
- **Azure Static Web Apps** - With SSR support

**Self-Hosted**
```bash
# Build the application
npm run build

# Start production server
npm run start
```

The production server runs on port 3000 by default.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘N` / `Ctrl+N` | New folder |
| `⌘U` / `Ctrl+U` | Upload files |
| `⌘F` / `Ctrl+F` | Search files |
| `⌘W` / `Ctrl+W` | Close current tab |
| `⌘T` / `Ctrl+T` | New tab |
| `Escape` | Close modals/Clear selection |
| `Delete` | Delete selected items |
| `Enter` | Open selected folder/file |
| `⌘A` / `Ctrl+A` | Select all items |

## 🐛 Troubleshooting

### Common Issues

**1. CORS Errors**
```
Access to fetch at 'http://localhost:5001' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution**: See `CORS_TROUBLESHOOTING.md` for detailed backend configuration.

**2. Authentication Redirect Loop**
- Clear browser cookies and localStorage
- Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Check that backend auth endpoints are accessible

**3. File Upload Fails**
- Check file size (default limit: 100MB)
- Verify backend is running on correct port
- Check network tab for specific error messages
- Ensure `NEXT_PUBLIC_DRIVE_API_BASE_URL` is configured

**4. Tabs Not Persisting**
- Clear Zustand persisted state: `localStorage.removeItem('brmh-drive-ui')`
- Refresh the page

**5. Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Debug Mode

Enable detailed logging:
1. Open browser DevTools (F12)
2. Check Console for debug logs
3. Enable TanStack Query DevTools (appears in bottom-right)

## 🎯 Roadmap

- [ ] Real-time collaboration
- [ ] Advanced file preview (PDF, Office docs)
- [ ] Version control for files
- [ ] Bulk operations optimization
- [ ] Mobile apps (iOS/Android)
- [ ] Desktop app (Electron)
- [ ] Offline mode with sync
- [ ] Advanced search filters
- [ ] Activity timeline
- [ ] File comments and annotations

## 🙏 Acknowledgments

Built with these amazing technologies:

- [Next.js 15](https://nextjs.org/) - The React Framework for Production
- [React 19](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS 4](https://tailwindcss.com/) - Styling Framework
- [shadcn/ui](https://ui.shadcn.com/) - Component Library
- [Radix UI](https://www.radix-ui.com/) - Unstyled UI Primitives
- [Lucide Icons](https://lucide.dev/) - Beautiful Icons
- [Zustand](https://zustand-demo.pmnd.rs/) - State Management
- [TanStack Query](https://tanstack.com/query) - Data Fetching & Caching
- [React Dropzone](https://react-dropzone.js.org/) - File Upload
- [Sonner](https://sonner.emilkowal.ski/) - Toast Notifications
- [cmdk](https://cmdk.paco.me/) - Command Palette

## 📞 Support

Need help? Here's how to get support:

- 📖 **Documentation**: Check this README and `CORS_TROUBLESHOOTING.md`
- 🐛 **Issues**: [Open an issue on GitHub](https://github.com/your-org/brmh-drive-frontend/issues)
- 💬 **Discussions**: Share ideas and ask questions
- 📧 **Email**: Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**🚀 Built with ❤️ by the BRMH Team**

**Powered by Next.js 15, React 19, TypeScript, and Tailwind CSS 4**

[Report Bug](https://github.com/your-org/brmh-drive-frontend/issues) · [Request Feature](https://github.com/your-org/brmh-drive-frontend/issues) · [Documentation](https://github.com/your-org/brmh-drive-frontend/wiki)

</div>
