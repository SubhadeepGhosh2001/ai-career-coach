# 🧠 SensAI – AI Career Coach

SensAI is a **full-stack AI-powered career coaching platform** that helps users generate personalized career guidance, resumes, and cover letters using **Generative AI**.

The project is built with a **production-first mindset**, focusing on real-world challenges like authentication, database integration, CI/CD, and deployment stability.

---

## 🚀 Features

- 🔐 **Authentication & Authorization**
  - Secure authentication using **Clerk**
  - Protected routes for authenticated users

- 🤖 **AI-Powered Career Assistance**
  - AI-generated career guidance
  - AI-generated cover letters
  - Personalized responses based on user input

- 🎨 **Modern UI / UX**
  - Built with **Next.js App Router**
  - Styled using **Tailwind CSS** and **shadcn/ui**
  - Dark mode support

- 🧱 **Scalable Architecture**
  - Server components and server actions
  - API routes for backend logic
  - Clean separation of concerns

- ☁️ **Production Deployment**
  - CI-ready build configuration
  - Environment-based secrets management
  - Deployed on **Vercel**

---

## 🛠 Tech Stack

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- shadcn/ui

### Backend
- Node.js
- Next.js API Routes
- Prisma ORM

### Database
- PostgreSQL

### Authentication
- Clerk

### AI / Generative AI
- Google Gemini API

### DevOps / Deployment
- GitHub Actions (CI)
- Vercel (Hosting & Deployment)

---

## 📂 Project Structure

```text
app/
├── (auth)/            # Authentication routes (sign-in / sign-up)
├── (main)/            # Main application routes
├── api/               # Backend API routes
├── lib/               # Server-only utilities (Prisma, helpers)
├── layout.js          # Root layout (dynamic rendering)
├── page.jsx           # Home page
├── not-found.jsx      # Custom 404 page
