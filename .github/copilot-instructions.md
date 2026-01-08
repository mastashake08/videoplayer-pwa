# Copilot Instructions

## Project Overview

This is a Laravel 12 + Vue 3 + TypeScript **Progressive Web App (PWA)** for playing videos offline using Video.js and WebTorrent. Built with Inertia.js for seamless SPA-style navigation without a separate API layer. The frontend uses Vite, Tailwind CSS v4, and shadcn-vue (Reka UI) components.

**Video Features**:
- File System API integration for accessing local video files
- Upload videos directly to the app
- Play videos from magnet links (WebTorrent)
- Stream videos from remote URLs
- Offline-capable PWA using vite-plugin-pwa

## Architecture

**Full-Stack Monolith**: Backend (Laravel PHP) and frontend (Vue/TS) live in one repository. Inertia.js acts as the glue - controllers return Inertia responses with props instead of JSON, and Vue pages receive them directly.

**Key Directories**:
- `app/Http/Controllers/` - Laravel controllers that return Inertia responses
- `resources/js/pages/` - Vue page components (maps to routes)
- `resources/js/components/` - Reusable Vue components (shadcn-vue in `ui/`)
- `resources/js/layouts/` - Page layout wrappers (AppLayout, AuthLayout)
- `resources/js/composables/` - Vue composition API utilities
- `routes/web.php` - Main route definitions (see also `routes/settings.php`)

## Development Workflows

**Setup**: Run `composer setup` to install dependencies, generate app key, migrate DB, and build assets.

**Local Development**:
- `composer run dev` - Starts PHP server + Vite dev server concurrently
- Frontend: `npm run dev` (Vite HMR)
- Backend: `php artisan serve`

**Building**: `npm run build:ssr` compiles both client and SSR bundles.

**Testing**: Uses Pest (PHP testing framework)
- `php artisan test` or `vendor/bin/pest`
- Test files in `tests/Feature/` and `tests/Unit/`
- Common pattern: `uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);` at file level

**Code Quality**:
- PHP: `./vendor/bin/pint` (Laravel Pint for formatting)
- TypeScript: `npm run lint` (ESLint), `npm run format` (Prettier)
- ESLint ignores `resources/js/components/ui/*` (generated shadcn components)

## Conventions & Patterns

### Routing with Wayfinder
Uses Laravel Wayfinder to generate type-safe route helpers at `@/routes`. Import like:
```typescript
import { dashboard } from '@/routes';
import { edit, update } from '@/routes/profile';
```
These provide `.url` property and form helpers. **Never hardcode URLs** - always use these generated helpers.

### Inertia Page Structure
Pages use script setup and receive props via `defineProps`:
```vue
<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue';
import { Head } from '@inertiajs/vue3';

interface Props {
  mustVerifyEmail: boolean;
  status?: string;
}
defineProps<Props>();
</script>
```

### Controller Patterns
Controllers return Inertia responses with typed props:
```php
return Inertia::render('settings/Profile', [
    'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
    'status' => $request->session()->get('status'),
]);
```

### Form Validation
Use Form Request classes in `app/Http/Requests/` for validation logic (e.g., `ProfileUpdateRequest`). Keep controllers thin.

### TypeScript Paths
Import aliases configured in `tsconfig.json`:
- `@/*` → `resources/js/*`
- `@/components` → `resources/js/components`
- `@/lib/utils` → `resources/js/lib/utils`

### Authentication
Laravel Fortify handles auth (login, register, password reset, 2FA). Views are Inertia pages in `resources/js/pages/auth/`. All auth views are configured in `FortifyServiceProvider`.

### Theming
Dark/light mode managed via `useAppearance` composable. Stores preference in localStorage + cookie. The `initializeTheme()` in `app.ts` initializes theme on page load.

### UI Components
Uses shadcn-vue (Reka UI port) with New York v4 style. Generate components with `npx shadcn-vue@latest add <component>`. Components in `resources/js/components/ui/` - **do not manually edit these**, regenerate if needed.

## Integration Points

- **Database**: Configured in `config/database.php`, migrations in `database/migrations/`
- **Sessions**: File-based by default (`storage/framework/sessions`)
- **Queue**: Sync driver by default (see `config/queue.php`)
- **Auth Middleware**: `auth`, `verified` (see `routes/web.php` usage)

## Common Tasks

**Adding a new page**:
1. Create Vue component in `resources/js/pages/`
2. Add route in `routes/web.php` returning `Inertia::render('PageName')`
3. Import route helper from `@/routes` in components

**Adding a settings page**:
- Routes go in `routes/settings.php`
- Controllers in `app/Http/Controllers/Settings/`
- Pages in `resources/js/pages/settings/`
- Use `AppLayout` wrapper with breadcrumbs

**Making API-style requests** (rare in this stack):
Use Inertia's router methods: `router.post()`, `router.put()`, etc. Form submissions typically post to Laravel routes that redirect back with flash messages.

## Video Player Architecture

**Video Sources** (priority order):
1. **File System API** - Use when available to access local files without upload
2. **Upload** - File input for browsers without File System API support
3. **Magnet Links** - WebTorrent integration for P2P streaming
4. **Remote URLs** - Direct video streaming from HTTP(S) sources

**Key Libraries**:
- `video.js` - Core video player
- `webtorrent` - P2P video streaming via torrents
- `vite-plugin-pwa` - Service worker and manifest generation

**PWA Configuration** (`vite.config.ts`):
- Service worker auto-updates on changes
- Video caching strategy with 30-day expiration
- Manifest configured for installable app experience

## Important Notes

- **No separate API layer** - Inertia bridges Laravel and Vue directly
- **SSR ready** - `resources/js/ssr.ts` handles server-side rendering
- **Breadcrumbs** - AppLayout expects `breadcrumbs` prop (array of `BreadcrumbItem`)
- **Global types** - `resources/js/types/globals.d.ts` extends Inertia's PageProps with `AppPageProps` (auth, name, quote, sidebarOpen)
- **PWA Build** - Run `npm run build` to generate service worker and manifest
