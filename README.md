# Video Player PWA

A modern Progressive Web App for playing videos from multiple sources with offline support. Built with Laravel 12, Vue 3, TypeScript, and Inertia.js.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-12-red.svg)
![Vue](https://img.shields.io/badge/Vue-3-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)

## ✨ Features

### Video Sources
- **🗂️ Local Files** - Access videos directly from your device using the File System Access API (Chrome/Edge)
- **📤 Upload** - Standard file upload for browsers without File System API support
- **🧲 Magnet Links** - Stream videos via P2P using WebTorrent (no server required)
- **🔗 Remote URLs** - Stream videos directly from any HTTP(S) URL

### Progressive Web App
- ✅ **Offline Support** - Videos are cached for offline playback
- ✅ **Installable** - Can be installed on any device like a native app
- ✅ **Service Worker** - Auto-updates and efficient caching
- ✅ **Responsive** - Works seamlessly on desktop, tablet, and mobile

### Developer Experience
- 🎨 **Modern UI** - shadcn-vue components with Tailwind CSS v4
- 🔐 **Authentication** - Laravel Fortify with 2FA support
- 🧪 **Testing** - Pest PHP testing framework
- 🎯 **Type-Safe Routing** - Laravel Wayfinder for type-safe routes
- 🚀 **Hot Module Replacement** - Vite for instant dev feedback

## 🛠️ Tech Stack

### Backend
- **Laravel 12** - PHP framework
- **Laravel Fortify** - Authentication scaffolding
- **Inertia.js** - SPA without API complexity
- **SQLite/MySQL/PostgreSQL** - Database support

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool with HMR
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn-vue** - Beautiful UI components (Reka UI)

### Video & PWA
- **Video.js** - HTML5 video player
- **WebTorrent** - P2P streaming
- **vite-plugin-pwa** - PWA support with Workbox

## 📋 Prerequisites

- **PHP** >= 8.2
- **Node.js** >= 22 (specified in `.nvmrc`)
- **Composer** >= 2.0
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd videoplayer-pwa
```

### 2. Install dependencies and setup
```bash
composer setup
```

This command will:
- Install PHP dependencies
- Copy `.env.example` to `.env`
- Generate application key
- Run database migrations
- Install Node dependencies
- Build frontend assets

### 3. Start development servers
```bash
composer run dev
```

This starts both:
- Laravel development server (http://localhost:8000)
- Vite dev server with HMR

### Alternative: Using Laravel Sail (Docker)
```bash
./vendor/bin/sail up -d
./vendor/bin/sail npm run dev
```

## 💻 Development Workflow

### Running the Application
```bash
# Start both servers concurrently
composer run dev

# Or start separately
php artisan serve        # Backend only
npm run dev             # Frontend only (Vite)
```

### Building for Production
```bash
# Build client-side assets
npm run build

# Build with SSR support
npm run build:ssr
```

### Code Quality
```bash
# PHP formatting (Laravel Pint)
./vendor/bin/pint

# TypeScript linting
npm run lint

# Code formatting
npm run format

# Format check only
npm run format:check
```

### Testing
```bash
# Run all tests
php artisan test

# Or use Pest directly
vendor/bin/pest

# Run specific test file
vendor/bin/pest tests/Feature/DashboardTest.php
```

## 📁 Project Structure

```
├── app/
│   ├── Http/
│   │   ├── Controllers/        # Inertia controllers
│   │   ├── Middleware/
│   │   └── Requests/          # Form request validation
│   ├── Models/
│   └── Providers/
├── resources/
│   ├── css/
│   │   └── app.css            # Tailwind CSS
│   └── js/
│       ├── components/        # Vue components
│       │   ├── ui/           # shadcn-vue components
│       │   ├── VideoPlayer.vue
│       │   └── VideoSourceSelector.vue
│       ├── composables/       # Vue composables
│       │   ├── useFileSystem.ts
│       │   ├── useWebTorrent.ts
│       │   └── useAppearance.ts
│       ├── layouts/          # Page layouts
│       ├── pages/            # Inertia pages (routes)
│       ├── types/            # TypeScript definitions
│       ├── app.ts            # Application entry
│       └── ssr.ts            # SSR entry
├── routes/
│   ├── web.php              # Main routes
│   └── settings.php         # Settings routes
├── tests/
│   ├── Feature/             # Feature tests
│   └── Unit/                # Unit tests
├── vite.config.ts           # Vite configuration
├── components.json          # shadcn-vue config
└── .nvmrc                   # Node version
```

## 🎮 Usage Guide

### Playing Videos

#### 1. Local Files (File System API)
Best for: Modern browsers (Chrome, Edge) with large video files
```
1. Navigate to the player
2. Select "Local Files" tab
3. Click "Choose Video File"
4. Grant file access permission
5. Select your video file
```

#### 2. Upload
Best for: Any browser, small to medium files
```
1. Navigate to the player
2. Select "Upload" tab
3. Choose a video file from your device
4. Video starts playing automatically
```

#### 3. Magnet Links
Best for: Public torrents, P2P streaming
```
1. Navigate to the player
2. Select "Magnet" tab
3. Paste a magnet URI
4. Click "Load"
5. Wait for peers to connect
```

#### 4. Remote URLs
Best for: Videos hosted on servers or CDNs
```
1. Navigate to the player
2. Select "URL" tab
3. Paste video URL (e.g., https://example.com/video.mp4)
4. Click "Load"
```

### PWA Installation

#### Desktop (Chrome/Edge)
1. Visit the app in your browser
2. Click the install icon in the address bar
3. Click "Install"

#### Mobile (iOS/Android)
1. Visit the app in Safari or Chrome
2. Tap the share button
3. Select "Add to Home Screen"

## 🎨 UI Customization

### Theme
The app supports dark/light mode with system preference detection.

```typescript
import { useAppearance } from '@/composables/useAppearance';

const { appearance, setAppearance, resolvedAppearance } = useAppearance();

// Set theme
setAppearance('dark' | 'light' | 'system');
```

### Adding shadcn-vue Components
```bash
npx shadcn-vue@latest add <component-name>
```

Example:
```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add card
```

## 🔒 Authentication

The app uses Laravel Fortify for authentication:
- Login / Register
- Password Reset
- Email Verification
- Two-Factor Authentication (2FA)

All auth views are Inertia pages located in `resources/js/pages/auth/`.

## 🧪 Testing Best Practices

### Feature Tests
```php
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated users can visit the player', function () {
    $user = User::factory()->create();
    $this->actingAs($user);
    
    $response = $this->get(route('player'));
    $response->assertStatus(200);
});
```

### Component Tests (Frontend)
While not configured by default, you can add:
- **Vitest** for unit testing
- **@vue/test-utils** for component testing

## 📦 Environment Variables

Key variables in `.env`:

```env
APP_NAME="Video Player PWA"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=sqlite
# Or use MySQL/PostgreSQL:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

## 🌐 Deployment

### Build Assets
```bash
npm run build:ssr
```

### Optimize Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Server Requirements
- PHP 8.2+
- Composer
- Web server (Nginx/Apache) with proper Laravel configuration
- HTTPS (required for PWA features)

### Deploying to Laravel Cloud
```bash
# Follow the button on the welcome page
# Or visit https://cloud.laravel.com
```

## 🔧 Configuration

### PWA Configuration
Located in `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Video Player PWA',
    short_name: 'VideoPlayer',
    theme_color: '#ffffff',
    // ... more options
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.(mp4|webm|ogg|mkv)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'video-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
})
```

### Adding Routes
Routes use Inertia.js. Example:

```php
// routes/web.php
Route::get('player', function () {
    return Inertia::render('Player');
})->middleware(['auth'])->name('player');
```

Then import the route helper:
```typescript
import { player } from '@/routes';

// Use in component
<Link :href="player().url">Go to Player</Link>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- PHP: Follow Laravel conventions, use Pint for formatting
- TypeScript: ESLint + Prettier configuration included
- Vue: Composition API with `<script setup>`

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- [Laravel](https://laravel.com)
- [Vue.js](https://vuejs.org)
- [Inertia.js](https://inertiajs.com)
- [Video.js](https://videojs.com)
- [WebTorrent](https://webtorrent.io)
- [shadcn-vue](https://shadcn-vue.com)
- [Tailwind CSS](https://tailwindcss.com)

## 📧 Support

For support, email your-email@example.com or open an issue in the GitHub repository.

---

**Made with ❤️ using Laravel, Vue, and TypeScript**
