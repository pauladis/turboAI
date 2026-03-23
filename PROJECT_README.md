# Notes Taking App - Full Stack Implementation

A modern, full-stack notes-taking application built with Django (backend) and Next.js (frontend). Users can organize their notes by categories with beautiful, responsive UI.

## Features ✨

- **User Authentication**: Secure signup/login with JWT tokens
- **Notes Management**: Create, edit, delete notes with auto-save
- **Categories**: Auto-generated categories (Random Thoughts, School, Personal) with custom colors
- **Smart Date Display**: "Today", "Yesterday", or "Month Day" format
- **Category Filtering**: Filter notes by category
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Notes update immediately without page refresh

## Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **Simple JWT** - Token-based authentication
- **SQLite** - Database (SQLite for dev, PostgreSQL for production)
- **Gunicorn** - WSGI server
- **Docker** - Containerization

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **Docker** - Containerization

## Key Design and Technical Decisions

### Authentication & Security
- **JWT Tokens**: Implemented Simple JWT for stateless authentication. Tokens are stored in localStorage with automatic refresh on expiry via axios interceptor.
- **Token Refresh Flow**: On 401 responses, the axios interceptor automatically attempts to refresh the token using the refresh token. Failed refreshes redirect to login.
- **Username-based Login**: The token endpoint requires `username` (not email) for login, matching Django's default authentication.

### Frontend Architecture
- **Zustand Store**: Lightweight state management for auth (login, user info) and notes (Zustand store is prepared but components handle most state locally).
- **ContentEditable divs**: Note title and content use HTML5 `contentEditable` instead of textarea to allow better formatting and future rich text support. State is NOT controlled through React (to avoid cursor position issues); instead, we read directly from DOM refs.
- **Client-side Category Enrichment**: When notes are fetched from the backend, they don't initially have `category_color` and `category_name`. The frontend enriches notes with these values by looking them up from the categories list.
- **Root Page Redirect**: The `/` route redirects authenticated users to `/dashboard` and unauthenticated users to `/auth/login` for seamless navigation.

### Backend Architecture
- **Pagination**: Django REST Framework's default pagination is enabled (PageNumberPagination with PAGE_SIZE=100). Frontend API client handles extracting the `results` array from paginated responses.
- **Model Relationships**: Notes have a ForeignKey to Category with `on_delete=models.SET_NULL` so deleting a category doesn't delete notes.
- **Automatic Category Creation**: When a user logs in for the first time, three default categories (Random Thoughts, School, Personal) are created automatically via the frontend.
- **User-scoped Queries**: All queries filter by `request.user` to ensure users only see their own categories and notes.

### Date Handling
- **Creation Date Display**: Note cards show `created_at` (not `last_edited`) to track when notes were created.
- **Smart Date Formatting**: Dates are formatted as "Today", "Yesterday", or "Mon DD" (month and day) using the `formatDate` utility.
- **Timezone**: UTC is used throughout for consistency.

### Category Counts
- **Local Updates**: When notes are created, deleted, or moved between categories, the frontend updates category counts optimistically to avoid extra API calls.
- **Count Calculation**: Backend uses `note_count = serializers.SerializerMethodField()` with `get_note_count()` to dynamically calculate note counts per category.

### API Response Handling
- **Paginated Responses**: The backend returns paginated responses with `{count, next, previous, results}` structure. Frontend's API client unwraps these to return just the array.
- **Error Handling**: Login/token errors return `{"detail": "..."}`, while field validation errors return `{"field": ["error message"]}`. Frontend error parsing handles both formats.

## Project Structure

```
turboAI/
├── backend/                    # Django REST API
│   ├── config/                # Settings, URLs, WSGI
│   ├── notes_app/             # Models, Views, Serializers
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                   # Environment variables
│
├── frontend/                   # Next.js React App
│   ├── app/                   # Pages (auth, dashboard)
│   ├── components/            # Reusable components
│   ├── lib/                   # API client, stores, utilities
│   ├── utils/                 # Helper functions
│   ├── styles/                # Global CSS
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── Dockerfile
│   └── .env.local             # Environment variables
│
├── docker-compose.yml         # Multi-container orchestration
├── .dockerignore
└── figma/                      # Design references
```

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Git

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd turboAI
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/admin

4. **Create a superuser (optional, for Django admin)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## API Endpoints

### Authentication
- `POST /api/users/register/` - Register new user
- `POST /api/token/` - Login and get JWT tokens
- `GET /api/users/me/` - Get current user info

### Categories
- `GET /api/categories/` - List all user categories
- `POST /api/categories/create_defaults/` - Create default categories
- `POST /api/categories/` - Create new category
- `PATCH /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

### Notes
- `GET /api/notes/` - List notes (with optional `?category_id=X` filter)
- `POST /api/notes/quick_create/` - Create empty note quickly
- `POST /api/notes/` - Create note with data
- `PATCH /api/notes/{id}/` - Update note
- `DELETE /api/notes/{id}/` - Delete note

## Frontend Pages

### `/auth/login`
Login page with email/username and password fields. Password toggle for visibility.

### `/auth/signup`
Registration page with email, username, and password fields with validation.

### `/dashboard`
Main app dashboard featuring:
- **Sidebar**: Categories with note counts, user info, logout button
- **Header**: Page title and "New Note" button
- **Grid**: Note cards with preview (title, content truncated, last edited)
- **Modal**: Note editor when clicking a card

## Components

### `NoteCard`
Displays note preview with:
- Category color background
- Last edited date (formatted)
- Category name
- Note title and truncated content

### `CategorySidebar`
Left sidebar with:
- User profile section
- Category list with note counts
- "All Categories" option
- New Note button
- Logout button

### `NoteEditor`
Modal dialog for editing notes:
- Editable title and content (contentEditable divs)
- Category selector with dynamic background color
- Last edited timestamp
- Delete, Close, Save buttons

## Configuration

### Backend Environment Variables (`.env`)
```
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,backend
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-jwt-secret
```

### Frontend Environment Variables (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Notes App
```

## Database Models

### User (Django built-in)
- id, email, username, password

### Category
- id, user_id, name, color, created_at

### Note
- id, user_id, category_id, title, content, created_at, last_edited

## Default Categories

Automatically created for new users:
1. **Random Thoughts** - #FFD93D (Yellow)
2. **School** - #6BCB77 (Green)
3. **Personal** - #FF6B9D (Pink)

## Date Formatting

- Same day: "Today"
- Previous day: "Yesterday"
- Other: "Mon 15" (Month and day, no year)

## Authentication Flow

1. User signs up with email, username, password
2. Backend creates user and returns success
3. User logs in with username and password
4. Backend returns JWT access and refresh tokens
5. Frontend stores tokens in localStorage
6. Subsequent API requests include Bearer token in Authorization header
7. Token refreshes automatically on expiry

## Development Notes

### Running Tests
```bash
docker-compose exec backend python manage.py test
```

### Making Migrations
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

### Accessing Django Shell
```bash
docker-compose exec backend python manage.py shell
```

### Frontend Development
Frontend runs in dev mode with hot reload. Files in `app/`, `components/`, and `lib/` automatically reload on save.

## Production Deployment

For production:
1. Update `DEBUG=False` in backend `.env`
2. Change `SECRET_KEY` to a strong random value
3. Update `ALLOWED_HOSTS` with your domain
4. Use PostgreSQL instead of SQLite
5. Change `CORS_ALLOWED_ORIGINS` to your frontend URL
6. Update `NEXT_PUBLIC_API_URL` to your backend URL

## Troubleshooting

### Backend won't start
- Check Docker logs: `docker-compose logs backend`
- Ensure migrations are applied: `docker-compose exec backend python manage.py migrate`

### Frontend showing 404
- Wait for Next.js to finish compiling (check `docker-compose logs frontend`)
- Clear browser cache and localStorage

### API calls failing
- Check CORS settings in `backend/config/settings.py`
- Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
- Check token expiry in browser localStorage

## Performance Optimizations

- Frontend uses Zustand for lightweight state management
- API requests are cached appropriately
- Notes grid uses CSS Grid for responsive layout
- Images and assets are optimized through Next.js

## Future Enhancements

- [ ] Search functionality
- [ ] Note sharing
- [ ] Markdown support
- [ ] Rich text editor
- [ ] Tags/hashtags
- [ ] Nested categories
- [ ] Collaborative editing
- [ ] Mobile app

## License

ISC

## Support

For issues and questions, please create an issue on GitHub.

---

**Happy note-taking! 📝**
