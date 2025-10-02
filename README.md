# 🛠️ HelpingHand Backend API

This is the **backend server** for the **TaskConnect** application — a platform that connects users with skilled professionals for task-based services like phone repair, car fixes, computer troubleshooting, carpentry, building work, and more.

---

## 🚀 Features

- User & Professional Registration/Login
- JWT-based Authentication
- Task Posting (Users only)
- Task Offers (Professionals only)
- Task Management (Edit/Delete with rules)
- Offer Management (Accept/Reject Offers)
- Commenting System
- Role-based Access Control (RBAC)
- Task Completion Handling

---

## 🧱 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for Password Hashing
- Morgan for Logging
- Dotenv for Env Variables
- CORS Support

---

## 📁 Project Structure

```bash
project/
│
├── controllers/
│   ├── auth.js           # Signup / Signin routes
│   ├── jwt.js            # JWT test routes
│   └── users.js          # User profile routes
│
├── middleware/
│   └── token.js          # JWT auth & role middleware
│
├── src/
│   ├── models/
│   │   ├── Task.js       # Task & Offer schema
│   │   └── User.js       # User schema
│   └── routes/
│       └── tasks.js      # Task and offer-related routes
│
├── .env                  # Environment variables (not committed)
├── README.md             # Project documentation
└── app.js                # Main server entry point



---

## 🔐 Authentication

- JWT is used for user authentication.
- Middleware `authMiddleware` checks for token validity.
- `requireRole('professional')` ensures route access by role.



### ✅ Auth Routes

| Method | Route          | Description                          |
|--------|----------------|--------------------------------------|
| POST   | /auth/sign-up  | Register a new user/professional     |
| POST   | /auth/sign-in  | Login and receive a JWT token        |

---

### 👤 User Routes

| Method | Route            | Description                |
|--------|------------------|----------------------------|
| GET    | /api/users/:id   | Get current user details   |

---

### 📋 Task Routes

| Method | Route                                                | Description                                         |
|--------|------------------------------------------------------|---------------------------
| POST   | /tasks/                                              | Create a new task (Users only)                      |
| GET    | /tasks/                                              | Users: Get own tasks / Professionals: All tasks     |
| PUT    | /tasks/:id                                           | Edit task (owner only, not if accepted)             |
| DELETE | /tasks/:id                                           | Delete task (owner only, not if accepted)           |
| POST   | /tasks/:id/offers                                    | Submit an offer to a task (Professionals only)      |
| POST   | /tasks/:taskId/complete                              | Mark task as complete (accepted professional only)  |
| POST   | /tasks/:taskId/offers/:offerId/decision              | Accept or reject an offer (owner only)              |
| POST   | /tasks/:id/comments                                  | Add comment (owner or professional)                 |

---

### 🧪 JWT Test Routes

| Method | Route              | Description                     |
|--------|--------------------|---------------------------------|
| GET    | /jwt/sign-token    | Create a dummy token (for test) |
| POST   | /jwt/verify-token  | Validate a JWT token            |

---

## 👥 User Roles & Access

| Role          | Capabilities                                                |
|---------------|-------------------------------------------------------------|
| User          | Create tasks, manage own tasks, comment                     |
| Professional  | View all tasks, send offers, complete assigned tasks        |

---

## 🚫 Access Control Rules

- ❌ Professionals **cannot create** tasks.  
- 👁️ Users **cannot see** others' tasks.  
- ✏️ Tasks **cannot be edited or deleted** after an offer is accepted.  
- ✅ Only the **accepted professional** can complete the task.  
- 🔐 Only the **task owner** can accept or reject offers.  




