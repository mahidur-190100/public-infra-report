# 🏙️ Public Infrastructure Issue Reporting System

A full-stack web application that allows citizens to report public infrastructure problems (potholes, broken streetlights, water leakage, garbage overflow, etc.) and enables government admins and staff to manage, track, and resolve these issues efficiently.

This system improves transparency, reduces response time, and makes municipal service delivery more efficient.

---

## 🔐 Admin Credentials

> ⚠️ For testing purposes only

* **Admin Email:** [admin@example.com]
* **Admin Password:** Admin!123

---

## 👤 Demo User Credentials

### 🧍 User Account

* **Email:** [user1@exaple.com]
* **Password:** User!111


> This citizen is a free user and has already reported 2 issues.

### 🧑‍🔧 Staff Account

* **Email:** [staff@example.com]
* **Password:** Staff!111

> This staff already has assigned issues and can update issue statuses.



---

## ✨ Key Features (Highlights)

* 🔐 Firebase Authentication (Email/Password & Google-In)
* 🧍 Role-based system (Admin, Staff, Citizen)
* 🏗️ Citizens can report real-world public infrastructure issues
* 🖼️ Image upload with issue reports
* 📍 Location-based issue reporting
* 👍 Upvote system (one upvote per user per issue)
* 🚀 Boost issue priority with payment
* ⏳ Real-time issue tracking with timeline history
* 📊 Dashboard analytics with charts & statistics
* 🧾 Payment system with downloadable PDF invoices
* ⭐ Premium subscription for unlimited issue reporting
* 🚫 Admin can block/unblock users
* 🧑‍🔧 Staff can update issue status and progress
* 📱 Fully responsive (mobile, tablet, desktop)

---

## 🏠 Home Page

* Responsive navbar with user profile dropdown
* Eye-catching banner / slider
* Latest resolved issues section
* Features section
* How it works section
* Extra informative sections
* Footer

---

## 📜 All Issues Page

* Displays all reported issues in card view
* Shows image, title, category, status, priority, location, and upvotes
* Server-side search and filtering
* Upvote functionality with proper rules

---

## 🔍 Issue Details Page (Private Route)

* Full issue information
* Edit & delete options for issue owner
* Boost issue priority with payment
* Assigned staff details
* Timeline / tracking history with audit trail

---

## 🧍 Citizen Dashboard (Private)

* Dashboard overview with statistics
* My Issues page (edit, delete, view)
* Report Issue form
* Free users can submit up to 2 issues
* Premium users can submit unlimited issues

---

## 🧑‍🔧 Staff Dashboard (Private)

* View only assigned issues
* Change issue status (Pending → In-Progress → Working → Resolved → Closed)
* Profile management

---

## 👑 Admin Dashboard (Private)

* Dashboard statistics & charts
* View and manage all issues
* Assign staff to issues
* Reject invalid issues
* Manage citizen users (block/unblock)
* Manage staff (add, update, delete)
* View all payments
* Download payment invoices (PDF)
* Admin profile management

---

## 💳 Subscription System

* Free users can report up to 2 issues
* Premium subscription: monthly and yearly
* Premium users get:

  * Unlimited issue reporting
  * Premium badge
  * Priority support

---

## 🧠 Issue Rejection Rules (Admin)

* Admin can reject an issue **only when status is Pending**
* Rejected issues cannot be edited, boosted, or assigned
* Rejection reason is stored and shown in timeline

---

## 🛠️ Technology Stack

### Frontend

* React
* Tailwind CSS / DaisyUI
* TanStack Query
* Axios
* Firebase Authentication
* React Router
* React Hot Toast / SweetAlert

### Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Role-based Access Control
