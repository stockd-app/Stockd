# Stockd - Virtual Pantry Management & Recipe Recommendation Application

<div  align="center">

**A smart pantry management application that helps you track food items, reduce waste, and get recipe recommendations based on what you have.**

<div align="center">
<a href="https://mahara.dkit.ie/view/view.php?t=d49471e26058ec6d1efb">
  <img src="https://img.shields.io/badge/Portfolio-View%20Project-blue" />
</a>
<a href="https://www.youtube.com/watch?v=QFqqp3ysVUE">
  <img src="https://img.shields.io/badge/YouTube-Technical%20Demo-red" />
</a>
</div>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)

- [Tech Stack](#tech-stack)

- [Getting Started](#getting-started)

- [Component Documentation](#component-documentation)

- [Development Setup](#development-setup)

- [Testing](#testing)

- [Contributors](#contributors)

- [Resources](#resources)

---

## 🎯 Overview

Stockd is a comprehensive virtual pantry and recipe recommendation application designed to help users manage their food inventory efficiently, reduce food waste, and discover recipes based on available ingredients. The application combines AI-powered food classification, intelligent recipe recommendations, and an intuitive user interface to create a seamless food management experience.

### Key Highlights

- 🤖 **AI-Powered**: Automatic food classification and intelligent recipe matching

- 📱 **Mobile-First**: Responsive design optimized for mobile devices

- 🔒 **Secure**: End-to-end encryption for sensitive user data

- 🐳 **Containerized**: Easy deployment with Docker

- ♿ **Accessible**: WCAG compliant with accessibility features

---

## 🏗️ System Architecture

Our system follows a microservices architecture with five main components working together seamlessly:

![System Architecture](https://mahara.dkit.ie/artefact/file/download.php?file=507448&view=143837&embedded=1&text=789619)

### Architecture Components

1.  **Frontend (React + TypeScript)**: User interface with responsive design

2.  **Backend (FastAPI + Python)**: RESTful API handling business logic

3.  **Database (MySQL)**: Encrypted data storage with audit logging

4.  **Food Classifier**: Categorizes food items from receipt

5.  **Recipe Recommender**: Suggests recipes based on available ingredients

---

## ✨ Features

### Core Functionality

- **📸 Receipt Scanning**: Upload grocery receipts to automatically add items to your pantry

- **🤖 AI-Powered Classification**: Automatically categorize food items using NLI

- **🍳 Recipe Recommendations**: Get personalized recipe suggestions based on:
  - Available ingredients in your pantry

  - Partial ingredient availability

  - Collaborative filtering from user preferences

- **📦 Smart Inventory Management**: Track items across Fridge, Freezer, and Pantry

- **🛒 Grocery List**: Auto-generate shopping lists from recipes

- **❤️ Recipe Collections**: Save and organize your favorite recipes

- **🔍 Advanced Search**: Filter recipes by ingredients, cuisine, dietary needs

- **♿ Accessibility Features**: Dark theme mode, text size change support

---

## 🛠️ Tech Stack

| Frontend                                                                                                                                                                           | Backend                                                                                                                                                                                                   | AI Services                                                                                                                                       | DevOps                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Framework**: React 18 + TypeScript <br> **Styling**: CSS3 (Variables) <br> **State**: Context API <br> **Build Tool**: Vite <br> **Auth**: Google OAuth 2.0 <br> **HTTP**: Axios | **Framework**: FastAPI (Python 3.11+) <br> **Database**: MySQL 8.0 <br> **ORM**: SQLAlchemy <br> **Auth**: JWT <br> **Encryption**: Fernet <br> **Rate Limiting**: SlowAPI <br> **Docs**: OpenAPI/Swagger | **Food Classifier**: <br> BART MNLI <br> <br> **Recipe Recommender**: <br> Scikit-learn <br> Collaborative filtering <br> Content-based filtering | **Containerization**: Docker & Compose <br><br> **Web Server**: Nginx <br><br> **Monitoring**: Kuma health checks <br><br> **Version Control**: Git & GitHub |

---

## 🚀 Getting Started

### Prerequisites

- Docker Desktop installed

- Git

- 4GB+ RAM available

- Ports 80, 8000, 9001, 9002, 3306 available

### Quick Start with Docker

The fastest way to run the entire application:

```bash

# 1. Clone the repository

git  clone <repository-url>

cd  Stockd



# 2. Set up environment variables

cd  Backend && cp  .env-sample  .env

# Edit Backend/.env with your credentials

cd  ../Frontend && cp  .env-sample  .env

# Edit Frontend/.env with your configuration

cd  ..



# 3. Build frontend

cd  Frontend

npm  install

npm  run  build

cd  ..



# 4. Start all services

chmod  +x  start-all.sh  stop-all.sh

./start-all.sh

```

**Services will be available at:**

- Frontend: `http://localhost`

- Backend API: `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`

- Food Classifier: `http://localhost:9002`

- Recipe Recommender: `http://localhost:9001`

**To stop all services:**

```bash

./stop-all.sh

```

For detailed Docker commands and troubleshooting, see [DOCKER.md](./DOCKER.md).

---

## 📚 Component Documentation

Each component has detailed documentation in its respective directory:

| 📱 [Frontend](./Frontend/README.md)                                     | 🔧 [Backend](./Backend/README.md)                    | 🗄️ [Database](./Database/README.md)                        | 🤖 [AI Services](./AI/README.md)                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- |
| React components <br> State management <br> Styling <br> Build & deploy | API endpoints <br> Auth flow <br> Models <br> Config | Schema design <br> Encryption <br> Queries <br> Audit logs | Classifier <br> Recommender <br> Training data <br> API specs |

---

## 💻 Development Setup

For local development without Docker:

### Backend Development

```bash

cd  Backend



# Create virtual environment

python  -m  venv  venv

source  venv/bin/activate  # Windows: venv\Scripts\activate



# Install dependencies

pip  install  -r  requirements.txt



# Set up environment

cp  .env-sample  .env

# Edit .env with your credentials



# Run development server

uvicorn  app.main:app  --reload

```

Backend runs at `http://localhost:8000`

### Frontend Development

```bash

cd  Frontend



# Install dependencies

npm  install



# Set up environment

cp  .env-sample  .env

# Edit .env with your configuration



# Run development server

npm  run  dev

```

Frontend runs at `http://localhost:5173`

### AI Services Development

**Food Classifier:**

```bash

cd  AI/Food_Classifier

python  -m  venv  venv

source  venv/bin/activate

pip  install  -r  food_classifier_requirements.txt

python  food_classifier_server.py

```

**Recipe Recommender:**

```bash

cd  AI/Recipe_Recommender

python  -m  venv  venv

source  venv/bin/activate

pip  install  -r  recipe_recommender_requirements.txt

python  recipe_recommender_server.py

```

---

## 🧪 Testing

### Mobile Testing

Test on mobile devices using your local network:

```bash

# Find your local IP

# macOS/Linux:

ifconfig | grep  "inet "



# Windows:

ipconfig

```

Access from mobile: `http://YOUR_LOCAL_IP` (e.g., `http://192.168.1.100`)

### Testing with ngrok

For external testing:

```bash

ngrok  http  5173  --log=stdout  --log-level=info

```

Update Google OAuth settings with the ngrok URL.

---

## 👥 Contributors

This project was developed by a talented team of students:

<table align="center">
<tr>
<td align="center">
<a href="https://github.com/Harjappan-Singh">
<img src="https://github.com/Harjappan-Singh.png" width="100px;" alt="Harjappan Singh"/><br/>
<sub><b>Harjappan Singh</b></sub>
</a><br/>
<sub>Team Lead</sub>
</td>
<td align="center">
<a href="https://github.com/henryelga">
<img src="https://github.com/henryelga.png" width="100px;" alt="Elga Jerusha Henry"/><br/>
<sub><b>Elga Jerusha Henry</b></sub>
</a><br/>
<sub>Backend Lead</sub>
</td>
<td align="center">
<a href="https://github.com/EricHanJf">
<img src="https://github.com/EricHanJf.png" width="100px;" alt="Jianfeng Han"/><br/>
<sub><b>Jianfeng Han</b></sub>
</a><br/>
<sub>UI/UX Lead</sub>
</td>
<td align="center">
<a href="https://github.com/LeafMonarch">
<img src="https://github.com/LeafMonarch.png" width="100px;" alt="Yee Chean"/><br/>
<sub><b>Yee Chean</b></sub>
</a><br/>
<sub>Frontend Lead</sub>
</td>
<td align="center">
<a href="https://github.com/milamurphy">
<img src="https://github.com/milamurphy.png" width="100px;" alt="Mila Murphy"/><br/>
<sub><b>Mila Murphy</b></sub>
</a><br/>
<sub>AI Lead</sub>
</td>
</tr>
</table>

---

## 📖 Resources

### 📚 Project Documentation

<div align="center">
<table>
<tr>
<th>📊 Portfolio</th>
<th>🎥 Screencast</th>
</tr>
<tr>
<td align="center">
<a href="https://mahara.dkit.ie/view/view.php?t=d49471e26058ec6d1efb">Open Portfolio</a>
</td>
<td align="center">
<a href="https://www.youtube.com/watch?v=QFqqp3ysVUE">Watch Demo</a>
</td>
</tr>
<tr>
<td>
Development process<br>
User testing<br>
Tech decisions<br>
Scrum planning<br>
Design iterations
</td>
<td>
Architecture<br>
Code structure<br>
Features demo<br>
Deployment
</td>
</tr>
</table>
</div>

---

### 📁 Additional Documentation

- 🐳 [Docker Setup](./DOCKER.md)
- 📱 [Frontend](./Frontend/README.md)
- 🔧 [Backend](./Backend/README.md)
- 🗄️ [Database](./Database/README.md)
- 🤖 [AI Services](./AI/README.md)

---

## 📄 License

This project was developed as part of an academic program at Dundalk Institute of Technology.

---

## 🙏 Acknowledgments

- Dundalk Institute of Technology for project support

- All contributors and testers who provided valuable feedback

- Open source community for the amazing tools and libraries

---

<div align="center">
<b>Made with ❤️ by the Stockd Team</b><br><br>
<a href="https://mahara.dkit.ie/view/view.php?t=d49471e26058ec6d1efb">📊 Portfolio</a> •
<a href="https://www.youtube.com/watch?v=QFqqp3ysVUE">🎥 Demo Video</a> •
<a href="https://github.com/Harjappan-Singh/Stockd/issues">🐛 Report Issues</a>
</div>
