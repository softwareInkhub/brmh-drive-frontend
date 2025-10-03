# 🚀 BRMH Drive

A modern, responsive file management system built with Next.js, TypeScript, and Tailwind CSS. BRMH Drive provides a Google Drive-like experience with a clean, material design interface.

![BRMH Drive](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-0.7+-000000?style=for-the-badge)

## ✨ Features

### 🎯 Core Functionality
- **File Management**: Upload, download, rename, delete files and folders
- **Folder Navigation**: Browse through your file system with breadcrumb navigation
- **Search**: Global search across all files and folders
- **Quick Access**: Recently accessed, starred, and shared items
- **Storage Monitoring**: Real-time storage usage tracking

### 🎨 User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Themes**: Toggle between light and dark modes
- **Grid & List Views**: Switch between grid and list view modes
- **Sorting Options**: Sort by name, date, size, or type
- **Drag & Drop**: Upload files by dragging and dropping

### 🔧 Advanced Features
- **Command Palette**: Quick access to actions with keyboard shortcuts
- **Context Menus**: Right-click actions for files and folders
- **Multi-select**: Select multiple items for batch operations
- **Breadcrumb Navigation**: Easy navigation through folder hierarchy
- **Mobile-First**: Fully responsive with mobile-optimized interactions

## 🛠️ Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icon library

### State Management & Data
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management and caching
- **React Dropzone** - Drag and drop file uploads

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **Testing Library** - React component testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 📁 Project Structure

```
brmh-drive-frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── folder/[id]/       # Dynamic folder pages
│   ├── preview/[id]/      # File preview pages
│   ├── recent/            # Recent files page
│   ├── starred/           # Starred files page
│   ├── shared/            # Shared files page
│   ├── trash/             # Trash page
│   ├── settings/          # Settings page
│   ├── search/            # Search results page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── ui/                # UI components
│   └── forms/             # Form components
├── lib/                   # Utilities and configurations
│   ├── types.ts           # TypeScript type definitions
│   ├── store-client.ts    # Zustand store
│   ├── hooks.ts           # Custom React hooks
│   ├── sorting.ts         # Sorting utilities
│   └── mock-data.ts       # Mock data
├── public/                # Static assets
└── styles/                # Global styles
```

## 🎨 UI Components

### Layout Components
- **Sidebar**: Navigation and quick access
- **Topbar**: Search, actions, and user controls
- **PageHeader**: Breadcrumbs and view controls
- **MainLayout**: Main application wrapper

### UI Components
- **FolderCard**: Grid view folder display
- **FileTile**: Grid view file display
- **FileTable**: List view file display
- **QuickAccess**: Recent and starred items
- **StorageWidget**: Storage usage indicator
- **UploadDropzone**: Drag and drop upload area

### Modals & Dialogs
- **UploadModal**: File upload interface
- **CommandMenu**: Command palette
- **ContextMenu**: Right-click actions
- **Toaster**: Notification system

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Optional: Add your environment variables here
```

### Tailwind Configuration
The project uses custom Tailwind classes for consistent styling:
- `.brmh-card` - Card component styling
- `.brmh-sidebar` - Sidebar styling
- `.brmh-content` - Content area styling
- `.brmh-grid` - Responsive grid layouts

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
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [TanStack Query](https://tanstack.com/query) - Data fetching

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Review the code examples

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
