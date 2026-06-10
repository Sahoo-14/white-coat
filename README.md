# 🏥 VitalNode: Nursing College & GNM Portal

[![Stack](https://img.shields.io/badge/Stack-Full--Stack-blue)](#)
[![Course](https://img.shields.io/badge/Course-GNM%20Nursing-green)](#)
[![Deployment](https://img.shields.io/badge/Status-Deployment--Ready-orange)](#)

## 📌 Overview
**VitalNode** is a full-stack digital hub engineered for nursing institutions managing **General Nursing and Midwifery (GNM)** programs. It bridges traditional nursing education with modern healthcare tech by tracking student enrollment, course delivery, and clinical training hours in a single responsive portal.

---

## 🚀 Key Features

### 🎓 Academic & Clinical Management
* **GNM Curriculum Hub:** Dedicated modules for Midwifery, Mental Health, and Community Health tracks.
* **Clinical Rotation Tracker:** Logs hospital field postings, bedside training hours, and student logs.
* **Resource Repository:** Central library for lecture notes, medical diagrams, and procedure videos.

### 🏢 Administration & Security
* **Automated Enrollment:** Digital workflow for applicant submissions and document verification.
* **Analytics Dashboard:** Real-time tracking of student academic performance and faculty schedules.
* **Data Security:** Encrypted access and secure token handling to protect student training records.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React.js / Tailwind CSS | Fully responsive student & faculty views |
| **Backend** | Node.js / Express.js | Robust API routing and system logic |
| **Database** | MongoDB / PostgreSQL | Relational and flexible asset storage |
| **Auth** | JWT (JSON Web Tokens) | Secure session management and access controls |
| **DevOps** | Docker / AWS / Vercel | Production deployment and CI/CD pipelines |

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v16.x or higher)
* MongoDB or PostgreSQL instance

### Quick Start
```bash
# Clone the repository
git clone [https://github.com/yourusername/vital-node.git](https://github.com/yourusername/vital-node.git)
cd vital-node

# Install Backend dependencies
cd backend && npm install

# Install Frontend dependencies
cd ../frontend && npm install

# Environment Configuration
# Create a .env file inside the /backend folder:
PORT=5000
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_secret_key

# Run the app locally (from root)
npm run dev
