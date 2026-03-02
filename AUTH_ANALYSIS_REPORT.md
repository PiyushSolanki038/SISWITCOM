# SISWIT Authentication System: Deep Dive Analysis

This document provides a technical breakdown of how the authentication system works across the frontend, backend, and database layers in the SISWIT project.

## 1. Frontend Architecture (React)

### UI Layer
- **Components**: Located in `src/features/auth/pages/`.
- **Styling**: Built with **Tailwind CSS** for responsive design and **Framer Motion** for smooth UI transitions (e.g., sliding alerts, modal popups).
- **Forms**: Managed by `react-hook-form` with **Zod** schema validation for strict type safety and error handling before data reaches the API.

### State & Persistence
- **AuthContext**: Centralizes authentication state using React Context.
- **LocalStorage**: Persists the session `token` and `user` profile object to maintain login state across page refreshes.
- **API Communication**: Uses native `fetch` for RESTful calls to the backend, including attaching the `x-auth-token` header for authorized requests.

---

## 2. Backend Logic (Node.js & Express)

### Core Authentication (`backend/routes/auth.js`)
The backend provides a stateless authentication system using **JWT (JSON Web Tokens)**.

| Flow | Logic Implementation |
| :--- | :--- |
| **Registration** | Creates a new user with `OWNER` role. Generates a unique `workspaceId` which is assigned as the `tenantId` (founding the multi-tenant scope). |
| **Password Security** | Uses `bcryptjs` with 10 salt rounds to hash passwords before storing them in the database. |
| **Login** | Validates credentials against the hashed password. Supports role-specific searching to ensure users log into the correct interface. |
| **Email Integration** | Automatically triggers emails for: 1. Welcome (Signup), 2. Login Notifications (Security), 3. Password Reset Links. |

---

## 3. Database Schema (PostgreSQL via Prisma ORM)

The database is structured to support a multi-tenant SaaS environment where each "Owner" has their own workspace.

### Core Models (`schema.prisma`)

#### User Model
```prisma
model User {
  id         String   @id @default(uuid()) @db.Uuid
  tenantId   String   @db.Uuid // Every user belongs to a tenant workspace
  email      String   @unique
  password   String?  // Hashed via bcrypt
  role       Role     // Enum: ADMIN, OWNER, EMPLOYEE, CUSTOMER
  subscriptionPlan   String?
  subscriptionStatus String?
  createdAt  DateTime @default(now())
}
```

#### Subscription & Payments
- **Subscription**: Links users to specific SaaS plans (`Starter`, `Professional`, `Enterprise`).
- **PaymentTransaction**: Logs payment attempts via providers like **Paytm**, tracking `orderId`, `txnId`, and `status`.

---

## 4. End-to-End Authentication Sequence

1. **User Action**: User enters credentials in the `SignIn.tsx` or `SignUp.tsx` form.
2. **Frontend Validation**: Zod ensures the email is valid and the password meets complexity requirements.
3. **API Request**: Frontend sends a `POST` request to `http://localhost:5000/api/auth/[login/signup]`.
4. **Backend Processing**:
   - For Signup: Backend hashes the password, creates a `User` entry in PostgreSQL, and generates a JWT.
   - For Login: Backend verifies the hashes and returns a JWT if valid.
5. **Token Management**: Frontend receives the JWT, saves it to `localStorage`, and updates the `AuthContext` state.
6. **Authorization**: Subsequent requests (like creating a workspace) include the JWT in the headers, which the backend middleware verifies.
