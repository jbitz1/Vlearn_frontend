# VizLearn Frontend

![VizLearn Logo](./public/images/vlearn_logo.png)

> An enterprise e-learning web application built with **React 18**, **Vite 5**, **Tailwind CSS v4**, and **React Router v7** — delivering competency-based curriculum lessons, an interactive concept viewer, over 140 STEM simulations, a rich pedagogical Content Studio, and multi-tenant institutional portals with M-Pesa billing.

---

## Table of Contents

- [Overview](#overview)
- [Key Features by Portal](#key-features-by-portal)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
  - [Running Tests](#running-tests)
  - [Linting](#linting)
- [Routing & Portals](#routing--portals)
- [User Roles & Access Control](#user-roles--access-control)
- [Lesson Architecture & Presentation Engine](#lesson-architecture--presentation-engine)
- [Science Simulations](#science-simulations)
- [Content Studio & Admin Suite](#content-studio--admin-suite)
- [API Communication & Authentication](#api-communication--authentication)
- [Configuration & Environment Variables](#configuration--environment-variables)
- [Common Troubleshooting](#common-troubleshooting)
- [Contributing](#contributing)

---

## Overview

**VizLearn** is a digital learning platform designed for primary, junior school, senior school, and secondary education following the Kenya Competency-Based Curriculum (CBC) and secondary syllabi.

The frontend client serves four distinct authenticated user roles:
1. **Student Portal** (`/student/*`) — Curriculum navigation, structured concept-by-concept lesson delivery, over 140 interactive STEM simulations, and timed quizzes.
2. **Teacher Portal** (`/teacher/*`) — Class rosters, stream teaching workspaces, lesson delivery logs, and examination mark entry.
3. **School Administrator Portal** (`/school/*`) — Multi-tenant institutional management, grade/class/stream structures, teacher assignments, student rosters, institutional subscription management, and performance analytics.
4. **Platform Admin Portal** (`/admin-dashboard/*`) — Content Studio authoring suite, Curriculum Builder tree management, AI review panels, revision quiz managers, ingestion sandboxes, and issue triage.

---

## Key Features by Portal

### Student Portal (`/student/*`)
- 📖 **Curriculum Hierarchy** — Structured progression across Grade/Form, Subject, Topic, and Modular Learning Units.
- 💡 **Concept-by-Concept Lesson Viewer** — Interactive paginated presentation engine supporting KaTeX mathematics, rich definitions, worked examples, and pedagogical checkpoints.
- 🔬 **STEM Science Simulations** — Over 140 interactive physics, chemistry, biology, and mathematics simulations with dynamic lazy-loading and external PhET simulation runner support.
- ⏱️ **Assessments & Quizzes** — Timed quizzes with real-time countdowns, attempt tracking, instant scoring, and past results history.
- 💳 **Self-Service Subscriptions** — M-Pesa STK push checkout and automatic polling for individual student plans.

### Teacher Portal (`/teacher/*`)
- 🏫 **My Classes & Streams** — Assigned stream rosters and student lists.
- 📚 **Teaching Workspace** — Stream-specific topic workspaces and lesson presentation controls.
- 📝 **Assessment Entry** — Exam recording, KCSE structured grading rubrics, and marks entry.
- 📈 **Performance Insights** — Subject and stream-level academic progress indicators.

### School Administrator Portal (`/school/*`)
- 🏛️ **Academic Structure** — Manage academic years, grades, classes, and streams.
- 👥 **Faculty & Student Rosters** — Add teachers, assign subjects to streams, enroll students, and oversee student profiles.
- 📊 **Institutional Analytics** — School, form, stream, and individual student academic performance tracking.
- 📑 **School Subscriptions** — Institutional billing management for term and annual school subscriptions.

### Platform Administrator Suite (`/admin-dashboard/*`)
- 🎨 **Content Studio** — Dual-pane authoring environment with real-time lesson preview, concept composer, and rich media slots.
- 🌳 **Curriculum Builder** — Interactive tree management for curricula, grades, subjects, topics, and learning units.
- 🤖 **AI Review & Quality Gates** — AI-assisted curriculum drafting, block regeneration, and pre-publish quality audits.
- 🛠️ **Administrative Utilities** — Revision quiz managers, ingestion sandboxes for staging datasets, and student-reported visualization issue triage.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev/) | 18.3.1 | Core UI framework |
| [Vite](https://vitejs.dev/) | 5.4.8 | Build tool and fast HMR development server |
| [React Router](https://reactrouter.com/) | 7.8.2 | Declarative client-side routing |
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.10 | Utility styling via `@tailwindcss/vite` and `@import "tailwindcss"` |
| [Axios](https://axios-http.com/) | 1.7.9 | HTTP client with automatic JWT bearer injection and 401 refresh interceptors |
| [KaTeX](https://katex.org/) | 0.16.10 | TeX math typesetting via `rehype-katex` and `remark-math` |
| [React Markdown](https://github.com/remarkjs/react-markdown) | 10.1.0 | Markdown rendering for lesson blocks and articles |
| [Framer Motion](https://www.framer.com/motion/) | 12.10.5 | Page transitions and interactive UI animations |
| [Lucide React](https://lucide.dev/) | 0.469.0 | Primary modern UI icon set |
| [Headless UI](https://headlessui.com/) | 2.2.4 | Accessible unstyled UI primitives |
| [SweetAlert2](https://sweetalert2.github.io/) | 11.15.10 | Interactive modal alerts and confirmation dialogs |
| [EmailJS](https://www.emailjs.com/) | 4.4.1 | Contact and demo-booking form submissions |
| [jwt-decode](https://github.com/auth0/jwt-decode) | 4.0.0 | Client-side JWT inspection and role extraction |

---

## Project Structure

```
Vlearn_frontend/
├── public/
│   ├── images/                        # Static brand assets (vlearn_logo.png, etc.)
│   └── ...
│
├── src/
│   ├── App.jsx                        # React Router configuration & role-guarded routes
│   ├── main.jsx                       # Entry point (StrictMode & UserProvider)
│   ├── index.css                      # Tailwind CSS v4 entry point (@import "tailwindcss", @theme)
│   ├── config.jsx                     # Runtime API Base URL resolution (reads VITE_API_BASE_URL)
│   │
│   ├── Pages/
│   │   ├── Home.jsx                   # Public marketing landing page & demo request
│   │   ├── ContactUs.jsx              # Public contact form
│   │   ├── LessonViewer.jsx           # Core concept-by-concept interactive lesson presenter
│   │   │
│   │   ├── User/                      # Student Portal pages
│   │   │   ├── Dashboard.jsx          # Main student home & subject enrollment overview
│   │   │   ├── SubjectsView.jsx       # Enrolled subjects catalog
│   │   │   ├── SubjectWorkspace.jsx   # Subject topic explorer & experiment viewer
│   │   │   ├── TopicWorkspace.jsx     # Topic lesson list & student completion status
│   │   │   ├── Quizzes.jsx            # Quiz catalog
│   │   │   ├── QuizAttempt.jsx        # Timed active quiz-taking interface
│   │   │   ├── Results.jsx            # Quiz attempt history and scoring breakdown
│   │   │   ├── Resources.jsx          # Downloadable course resources
│   │   │   ├── Simulations.jsx        # Simulation landing & subject catalog
│   │   │   └── Simulations/           # 140+ interactive STEM simulation components
│   │   │
│   │   ├── Teacher/                   # Teacher Portal pages
│   │   │   ├── TeacherDashboard.jsx   # Teacher overview & stream quick links
│   │   │   ├── MyClassPage.jsx        # Class roster and assigned students
│   │   │   ├── TeacherSubjectWorkspace.jsx # Subject & stream teaching workspace
│   │   │   ├── TeacherTopicWorkspace.jsx   # Topic teaching view
│   │   │   └── AssessmentEntry.jsx    # Exam mark entry and grading sheets
│   │   │
│   │   ├── School/                    # School Administrator Portal pages
│   │   │   ├── SchoolDashboard.jsx    # School overview metrics
│   │   │   ├── AcademicStructurePage.jsx # Grades, classes, and stream configuration
│   │   │   ├── SchoolTeachersPage.jsx # Teacher directory and stream assignments
│   │   │   ├── SchoolStudentsPage.jsx # Student roster and enrollment
│   │   │   ├── SchoolSubscriptionPage.jsx # Institutional subscription tier management
│   │   │   └── Performance/           # School, form, stream, and student performance views
│   │   │
│   │   └── Admin/                     # Platform Administrator Suite
│   │       ├── AdminDashboard.jsx     # Platform-wide usage & metrics
│   │       ├── CourseManagement.jsx   # Curriculum hierarchy & disaggregation inspector
│   │       ├── UserManagement.jsx     # User account management & role administration
│   │       ├── CurriculumBuilder.jsx  # Interactive curriculum tree builder
│   │       ├── RevisionQuizManager.jsx# Revision quiz authoring & question bank
│   │       ├── IngestionSandbox.jsx   # Staging testbed for imported curriculum sets
│   │       ├── ReportedIssues.jsx     # Issue triage for flagged visualizations
│   │       └── ContentStudio/         # Dual-pane concept authoring suite
│   │           ├── ContentStudio.jsx  # Core layout with real-time preview
│   │           └── composer/          # ConceptComposer, ComponentEditors, PublishGate
│   │
│   ├── Components/
│   │   ├── LessonBlocks/              # 25+ Pedagogical Blueprint rendering components
│   │   │   ├── BlockRenderer.jsx      # Block type dispatcher
│   │   │   ├── BlueprintComponents.jsx# Worked examples, KCSE blocks, math cards, callouts
│   │   │   └── ExamScriptReport.jsx   # Exam script performance report
│   │   ├── Navbar.jsx                 # Public & student navigation bar
│   │   ├── Footer.jsx                 # Global footer
│   │   ├── Login.jsx                  # Standard credentials login
│   │   └── SubscriptionPlan.jsx       # Pricing plans & M-Pesa STK push checkout
│   │
│   ├── Context/
│   │   └── UserContext.jsx            # User authentication state & token hydration
│   │
│   ├── services/
│   │   ├── studentCurriculumService.js# Student curriculum, topic progress, simulation APIs
│   │   ├── teacherCurriculumService.js# Teacher streams, subjects, lesson logs
│   │   ├── schoolAdminService.js      # School setup, academic structure, student rosters
│   │   ├── assessmentService.js       # Exam recording, marks entry, performance
│   │   └── presentation/              # PresentationEngine, PageGroupingService, normalizers
│   │
│   ├── component-library/             # Reusable design system (cards, forms, dialogs, auth)
│   ├── config/
│   │   └── apiClient.js               # Central Axios instance with JWT interceptors
│   │
│   └── tests/
│       ├── contentStudioRemediation.test.js # Presentation grouping and block order tests
│       └── phetSimulation.test.js     # PhET URL normalization and runner tests
│
├── package.json
├── package-lock.json
├── vite.config.js
└── .env.example
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18.18.0 or higher** (Node **v20 LTS** strongly recommended)
- [npm](https://www.npmjs.com/) **v9 or higher** (bundled with Node.js)
- A running [VizLearn Backend](https://github.com/Griffin-Ndede/Vlearn_backend) instance (defaults to `http://127.0.0.1:8000`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Griffin-Ndede/Vlearn_frontend.git

# 2. Navigate to project root
cd Vlearn_frontend

# 3. Install dependencies
npm install
```

### Environment Configuration

Create a local `.env` file from the example template:

```bash
cp .env.example .env
```

Ensure `VITE_API_BASE_URL` points to your backend instance:

```env
# Point to local Django backend or deployed API
VITE_API_BASE_URL=http://127.0.0.1:8000

# Optional: EmailJS keys for the landing page demo booking form
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

> **Note:** If `VITE_API_BASE_URL` is omitted, `src/config.jsx` dynamically falls back to `http://${window.location.hostname}:8000`.

### Running the Development Server

```bash
npm run dev
```

The application starts at [http://localhost:5173](http://localhost:5173).

### Building for Production

```bash
npm run build
```

Production assets are compiled into the `dist/` directory. Optimized code-splitting separates heavy math engines (`vendor-math`: KaTeX, remark, rehype), animations (`vendor-animation`), and icons (`vendor-ui`).

To preview the production bundle locally:

```bash
npm run preview
```

### Running Tests

The frontend contains test suites for presentation normalization and simulation resolution written for Node's native test runner:

```bash
node --test src/tests/*.test.js
```

### Linting

```bash
npm run lint
```

---

## Routing & Portals

Routes are defined in `src/App.jsx` using React Router v7. Access is strictly controlled through role-based guards (`RequireRole`, `ProtectedRoute`, and `SubscriptionRestricted`).

### Public & Authentication Routes
| Route | Component | Purpose |
|---|---|---|
| `/` | `Home` | Public marketing landing page & demo booking |
| `/login` | `Login` | Email & password authentication |
| `/register` | `Signup` | Student account registration |
| `/school-signup` | `SchoolSignUp` | Institutional onboarding registration |
| `/verify-otp` | `OTPVerification` | Phone OTP verification flow |
| `/phone-login` | `PhoneLogin` | Passwordless phone login |
| `/forgot-password` | `ForgotPassword` | Password recovery request |
| `/reset-password/:token` | `ResetPassword` | Token-based password reset |
| `/subscription` | `SubscriptionPlan` | Pricing plans and M-Pesa checkout |
| `/contact` | `ContactUs` | General inquiries contact page |

### Student Portal (`/student/*`)
Guarded by `RequireRole(["student", "school_admin", "platform_admin"])`.  
*(Legacy `/dashboard/*` paths automatically redirect to their `/student/*` equivalents.)*

| Route | Component | Guard / Access Level |
|---|---|---|
| `/student` | `Dashboard` | 🔒 Authenticated |
| `/student/subjects` | `SubjectsView` | 🔒 Auth + Subscription |
| `/student/subject/:subjectId` | `SubjectWorkspace` | 🔒 Auth + Subscription |
| `/student/topic/:topicId` | `TopicWorkspace` | 🔒 Auth + Subscription |
| `/student/lesson-viewer/:topicId?` | `LessonViewer` | 🔒 Auth + Subscription |
| `/student/simulations` | `Simulations` | 🔒 Auth + Subscription (`access_simulations`) |
| `/student/quizzes` | `Quizzes` | 🔒 Auth + Subscription (`access_assessments`) |
| `/student/quiz/:id` | `QuizAttempt` | 🔒 Auth + Subscription (`access_assessments`) |
| `/student/results` | `Results` | 🔒 Auth + Subscription |
| `/student/resources` | `Resources` | 🔒 Auth + Subscription (`access_downloads`) |
| `/student/profile` | `User` | 🔒 Authenticated |

### Teacher Portal (`/teacher/*`)
Guarded by `RequireRole(["teacher", "school_admin", "platform_admin"])`.

| Route | Component | Purpose |
|---|---|---|
| `/teacher` | `TeacherDashboard` | Teacher schedule & assigned stream cards |
| `/teacher/my-class` | `MyClassPage` | Class roster and student details |
| `/teacher/subject/:subjectId` | `TeacherSubjectWorkspace` | Subject curriculum explorer & lesson logs |
| `/teacher/topic/:topicId` | `TeacherTopicWorkspace` | Topic teaching plan and materials |
| `/teacher/assessments` | `AssessmentEntry` | KCSE exam marks entry and scoring sheets |
| `/teacher/performance` | `TeacherPerformance` | Stream academic progress and mastery |

### School Administrator Portal (`/school/*`)
Guarded by `RequireRole(["school_admin", "platform_admin"])`.

| Route | Component | Purpose |
|---|---|---|
| `/school/dashboard` | `SchoolDashboard` | Institution metrics, teacher & student totals |
| `/school/academic-structure`| `AcademicStructurePage` | Manage grades, classes, and streams |
| `/school/teachers` | `SchoolTeachersPage` | Faculty roster and subject/stream assignment |
| `/school/students` | `SchoolStudentsPage` | Student admissions and stream placement |
| `/school/subscription` | `SchoolSubscriptionPage` | School-level billing and seat allocation |
| `/school/performance` | `SchoolPerformance` | Form-wide and stream-wide examination analytics |

### Platform Administrator Suite (`/admin-dashboard/*`)
Guarded by `RequireRole(["platform_admin"])`.

| Route | Component | Purpose |
|---|---|---|
| `/admin-dashboard` | `AdminDashboard` | Platform-wide user metrics and ingestion stats |
| `/admin-dashboard/content-studio/:learningUnitId?` | `ContentStudio` | Dual-pane pedagogical authoring environment |
| `/admin-dashboard/curriculum-builder` | `CurriculumBuilder` | Tree manager for Curricula, Grades, Subjects, Topics |
| `/admin-dashboard/course-management` | `CourseManagement` | Curriculum hierarchy & disaggregation inspector |
| `/admin-dashboard/user-management` | `UserManagement` | User account management and role elevation |
| `/admin-dashboard/revision-quizzes` | `RevisionQuizManager` | Revision quiz question bank and paper builder |
| `/admin-dashboard/ingestion-sandbox` | `IngestionSandbox` | Sandbox staging area for ingested curriculum packs |
| `/admin-dashboard/reported-issues` | `ReportedIssues` | Triage interface for student/teacher reported visual bugs |

---

## User Roles & Access Control

User roles are enforced across both route navigation and API interceptors:
- **`student`** — Standard learner; access granted to `/student/*` and public routes.
- **`teacher`** — Educator; access granted to `/teacher/*` and student preview routes.
- **`school_admin`** — School principal/head teacher; access granted to `/school/*` institutional management.
- **`platform_admin`** — System superuser; complete access across all portals including `/admin-dashboard/*`.

### Guards
1. **`RequireRole` (`src/component-library/.../RequireRole.jsx`)**: Checks `user.role` from `UserContext`. Unauthenticated users are redirected to `/login?next=...`; authenticated users with unassigned roles go to `/role-selection`; users visiting an unauthorized portal are routed to their designated home.
2. **`SubscriptionRestricted` (`src/component-library/.../SubscriptionRestricted.jsx`)**: Enforces subscription feature permissions (`requireFeature`: `access_simulations`, `access_assessments`, `access_downloads`) and subject entitlements. *(In local development, staff and administrators automatically bypass subscription restrictions.)*

---

## Lesson Architecture & Presentation Engine

Lessons are delivered through an interactive presentation model rather than static text:

### 1. Pedagogical Blueprint Blocks (`src/Components/LessonBlocks/`)
All curriculum lessons render through `BlockRenderer.jsx`, which maps structured JSON blocks to over 25 specialized pedagogical components:
- **Core Instruction:** `LearningGoalBlock`, `ConceptExplanationBlock`, `DefinitionCardBlock`, `WorkedExampleBlock`, `AnalogyBlock`.
- **Misconception & Nuance:** `CommonMisconceptionBlock`, `CommonMistakeBlock`, `MemoryTipBlock`, `DidYouKnowBlock`.
- **Contextualization:** `RealWorldConnectionBlock`, `RealWorldExampleBlock`, `PredictionBlock`, `MiniActivityBlock`, `FormulaBreakdownBlock`.
- **Assessment & Examination:** `KCSEStructuredBlock` (full multi-part examination questions with sub-part mark breakdowns, student answer entries, and examiner marking rubrics), `KnowledgeCheckBlock` (interactive MCQs with immediate explanation), `QuizOverviewCard`.
- **Rich Media:** `ComparisonTableBlock`, `StepProcessBlock`, `SuggestedMediaBlock` (interactive SVG diagrams, YouTube embeds, simulations).

### 2. Presentation Normalization Engine (`src/services/presentation/`)
- `PresentationNormalizer.js`: Resolves block order precedence (`component_order ?? order`), normalizes block types, and formats KaTeX LaTeX strings.
- `PageGroupingService.js`: Automatically groups linear blocks into paginated concept cards for bite-sized reading.
- `LessonViewer.jsx`: Provides concept pagination, progress persistence in `localStorage`, estimated reading time indicators, and modal reporting for visual errors.

---

## Science Simulations

VizLearn includes **over 140 interactive STEM simulations** located in `src/Pages/User/Simulations/`:

- **Biology (35+ sims):** `AnimalVsPlantCellSim`, `DNAReplicationProteinSynthesisSim`, `MeiosisGeneticVariationSim`, `MammalianHeartStructureSim`, `SlidingFilamentMechanismSim`, `PlantTranspirationRateSim`, etc.
- **Chemistry (30+ sims):** `AcidBaseDissociationSim`, `BoylesLawSim`, `CharlesLawGuidedSim`, `ElectroplatingSim`, `HaberProcessSim`, `TitrationSim`, `VoltaicCellSim`, etc.
- **Physics (40+ sims):** `ACGeneratorSim`, `ArchimedesPrincipleSim`, `CompoundMicroscopeTelescopeSim`, `DomesticWiringRingMainSim`, `FaradaysLawInductionSim`, `PhotoelectricSim`, `TransformerSim`, etc.
- **Mathematics (10+ sims):** `DifferentiationSim`, `IntegrationSim`, `LinearProgrammingSim`, `MatrixTransformationSim`, `ThreeDGeometrySim`, `TrigonometryWaveSim`.

### Simulation Runtime
- **`SimulationWidgetFactory.jsx`** — Dynamically code-splits and lazy-loads simulation modules on demand to keep initial page bundles small.
- **`PhetSimulationRunner.jsx`** — Embeds external PhET interactive simulations seamlessly inside curriculum lessons.

---

## Content Studio & Admin Suite

The Platform Admin suite contains authoring tools for curriculum engineers:
- **`ContentStudio.jsx`** — Real-time split-screen authoring interface. Content editors modify blocks on the left while observing live student-view rendering on the right.
- **`ConceptComposer.jsx` & `ComponentEditors.jsx`** — Specialized rich-text, formula, and block parameter editors for all 25+ blueprint blocks.
- **`AIReviewPanel.jsx`** — Trigger automated Gemini-assisted block content drafting and review.
- **`PublishGate.jsx` & `QualityBar.jsx`** — Automated pre-publishing compliance checks (verifying learning objectives, misconception callouts, and worked examples before publishing).
- **`CurriculumBuilder.jsx`** — Complete administrative tree editor for managing Curricula, Grades, Subjects, Topics, and Learning Units.

---

## API Communication & Authentication

### Centralized Axios Client (`src/config/apiClient.js`)
All communication with the Django backend routes through a centralized Axios client:
- **Base URL:** Resolved from `VITE_API_BASE_URL` (or `http://${window.location.hostname}:8000`).
- **Token Storage:** JWT tokens are stored in `localStorage` under the key `'token'` as a JSON object:
  ```json
  {
    "access": "<access_token>",
    "refresh": "<refresh_token>",
    "role": "student",
    "user_id": 1
  }
  ```
- **Request Interceptor:** Injects `Authorization: Bearer <access_token>` on every outgoing request.
- **Response Interceptor:** Automatically catches HTTP 401 errors, calls `POST /api/token/refresh/` using the refresh token, updates `localStorage`, flushes pending request queues, and retries the original request seamlessly.

---

## Configuration & Environment Variables

| Variable | Purpose | Required? | Where Configured / Example |
|---|---|---|---|
| `VITE_API_BASE_URL` | Root URL of the Django backend REST API | **Yes** (in production) | `.env` (`http://127.0.0.1:8000` for local dev, `https://api.vizlearn.co` for prod) |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS service ID for marketing demo booking | Optional | `.env` (`<your-emailjs-service-id>`) |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS template ID for demo email delivery | Optional | `.env` (`<your-emailjs-template-id>`) |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS client public key | Optional | `.env` (`<your-emailjs-public-key>`) |

---

## Common Troubleshooting

### 1. Network Errors / Failed API Requests
- **Symptom:** API requests fail with `ERR_CONNECTION_REFUSED` or `CORS error`.
- **Cause:** Django backend is not running, or frontend is running on a port not present in backend CORS origins.
- **Fix:** Ensure backend is running at `http://127.0.0.1:8000`. In development (`DEBUG=True`), backend allows all origins. If `DEBUG=False`, verify your frontend origin is in `CORS_ALLOWED_ORIGINS`.

### 2. Admin Portal Lockout (Redirected to `/student`)
- **Symptom:** Logging in with a Django superuser account redirects to `/student` instead of `/admin-dashboard`.
- **Cause:** By default, `python manage.py createsuperuser` creates a user with `role='student'`.
- **Fix:** Open the Django backend shell and elevate the role to `platform_admin`:
  ```bash
  python manage.py shell -c "from Resources.models import User; u = User.objects.get(username='<your-user>'); u.role='platform_admin'; u.save()"
  ```

### 3. Missing Subject Lessons in Student Dashboard
- **Symptom:** Subject workspace loads but shows no topics or lessons.
- **Cause:** Database contains empty curriculum tables.
- **Fix:** On the backend, run curriculum seeding commands (`python manage.py populate_simulations` or relevant ingestion scripts) to populate curriculum data.

### 4. Case-Sensitive Filesystem Collisions
- **Symptom:** Git warnings or module import errors on macOS/Windows regarding `Hooks` vs `hooks`.
- **Context:** The repository contains both `src/Hooks/` (legacy) and `src/hooks/`. Keep imports aligned with the exact directory name when adding new hooks.

---

## Contributing

1. Fork the repository and create your feature branch: `git checkout -b feature/your-feature-name`
2. Validate syntax and ensure tests pass:
   ```bash
   npm run lint
   node --test src/tests/*.test.js
   ```
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your branch and open a Pull Request against `vlearn-revamp-frontend`.

---

*Part of the VizLearn platform — built for learners, teachers, and institutions across Kenya.*
