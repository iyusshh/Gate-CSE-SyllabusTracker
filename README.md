# GATE CSE Syllabus Tracker

> A modern and interactive web app to **track your GATE CSE preparation** — monitor your syllabus completion, visualize progress, and stay organized throughout your study journey.

🌐 **Live Demo:** [tracker-sybau.vercel.app](https://tracker-sybau.vercel.app)  
📦 **Repository:** [github.com/iyusshh/Tracker](https://github.com/iyusshh/Tracker)

---

## 🧭 Overview

Preparing for the **GATE Computer Science (CSE)** exam involves covering a large syllabus across multiple subjects.  
To make this easier, **GATE CSE Syllabus Tracker** provides a simple yet effective way to **mark completed topics**, **track progress**, and **visualize preparation** — all within a sleek, distraction-free interface.

It’s perfect for:
- GATE aspirants planning systematic study routines  
- Tracking progress by subjects like DSA, COA, OS, DBMS, CN, etc.  
- Staying motivated with a clear visual of what’s done and what’s pending  

---

## ✨ Features

| Feature | Description |
|----------|-------------|
| 📚 **Subject-Wise Tracking** | Browse through all GATE CSE subjects and mark topics as completed |
| 💾 **Auto Save Progress** | Uses browser’s localStorage — your progress is saved even after reload |
| 📊 **Progress Visualization** | See percentage or count of topics completed |
| 📱 **Responsive Design** | Works smoothly across mobile, tablet, and desktop |
| 🎨 **Minimal UI** | Clean, clutter-free, and focused on tracking |
| 🚀 **Fast & Lightweight** | Built with Next.js, optimized for instant load |
| 🧭 **User-Friendly** | Simple toggles and progress indicators — no login required |

---

## 🧠 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend Framework** | [Next.js](https://nextjs.org/) |
| **UI Library** | [React](https://react.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **State Management** | React Hooks + Local Storage |
| **Hosting** | [Vercel](https://vercel.com/) |
| **Version Control** | Git + GitHub |

---

## 🧩 Project Structure

Tracker/
│
├── public/ # Static assets (icons, favicon, etc.)
│
├── src/
│ ├── components/ # Reusable UI components (cards, buttons, progress bar)
│ ├── data/ # Syllabus data per subject (arrays or JSON)
│ ├── hooks/ # Custom hooks (e.g. useLocalStorage)
│ ├── pages/ # Next.js pages
│ │ ├── index.js # Main syllabus tracker page
│ │ └── api/ # API routes (if any future backend is added)
│ ├── styles/ # Tailwind & global CSS
│ └── utils/ # Helper functions (calculations, formatting)
│
├── package.json
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.js
└── README.md

---

## 🧰 Getting Started

Follow these steps to run the project locally.

### 1️⃣ Prerequisites
Make sure you have the following installed:
- Node.js (v16+)
- npm or yarn
- Git

### 2️⃣ Clone the Repository
```bash
git clone https://github.com/iyusshh/Tracker.git
cd Tracker
3️⃣ Install Dependencies
bash
Copy code
npm install
# or
yarn install
4️⃣ Run Development Server
bash
Copy code
npm run dev
# or
yarn dev
Now open http://localhost:3000 to view it in your browser.

5️⃣ Build for Production
bash
Copy code
npm run build
npm start

```
📈 Usage Guide
Open the Tracker App.

Scroll through subjects such as COA, OS, DBMS, DSA, CN, etc.

Click on a topic checkbox ✅ to mark it as completed.

Your progress will automatically be saved to your browser’s local storage.

Revisit anytime — your completion data remains intact even after refresh or restart.

🚀 Deployment
The app is hosted on Vercel — optimized for serverless deployment and continuous integration.
You can easily redeploy or fork this project to customize your own tracker:

Go to vercel.com

Import your GitHub repo (iyusshh/Tracker)

Configure build command (npm run build) and output directory (.next)

Deploy — your app goes live instantly ⚡

🌱 Future Enhancements
Planned Feature	Description
🔐 User Accounts	Log in via Google or GitHub and sync progress to the cloud
🧾 Statistics Dashboard	Visualize completion rate, subject-wise charts, and time tracking
🗓️ Study Planner	Set deadlines, reminders, or daily targets
🌓 Dark Mode	Switch between light and dark themes
📤 Export Progress	Download or share progress as a report
📱 PWA Support	Make the tracker installable on mobile devices

🤝 Contributing
Contributions are always welcome! 💪

Fork the repository

Create your feature branch

bash
Copy code
git checkout -b feature/your-feature
Commit your changes

bash
Copy code
git commit -m "Add your message"
Push to your branch

bash
Copy code
git push origin feature/your-feature
Open a Pull Request

Make sure your code follows linting rules and is tested before submitting.

📜 License
This project currently does not have a license specified.
You can add an MIT License or another open-source license as per your preference.

🙌 Acknowledgements
Inspired by the GATE CSE syllabus and the motivation to study systematically

Built with ❤️ using Next.js, React, and Tailwind CSS

Hosted and powered by Vercel

Thanks to all open-source contributors and learners using this tracker!

👤 Author
Aayush Rai (@iyusshh)
🎓 B.Tech CSE (AIML) @ SRM University, Kattankulathur
💻 Aspiring Software Engineer & GATE 2027 Aspirant
🌍 GitHub Profile

