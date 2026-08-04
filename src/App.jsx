import "/src/index.css";
import { createBrowserRouter, Outlet, RouterProvider, Navigate, useParams } from "react-router";
import ForgotPassword from "./Pages/ForgotPassword";

function RedirectWithParams({ to }) {
    const params = useParams();
    let target = to;
    Object.keys(params).forEach((key) => {
        target = target.replace(`:${key}`, params[key]);
    });
    return <Navigate to={target} replace />;
}
import ResetPassword from "./Pages/ResetPassword";
import Unauthorized from "./Pages/Unauthorized";
import StudentOnboarding from "./Pages/Onboarding/StudentOnboarding";
import SchoolOnboarding from "./Pages/Onboarding/SchoolOnboarding";
import InvitationAccept from "./Pages/Onboarding/InvitationAccept";
import Home from "../src/Pages/Home";
import Dashboard from "./Pages/User/Dashboard";
import ContactUs from "../src/Pages/ContactUs";
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import RoleSelection from "./Pages/Auth/RoleSelection";
import CourseDetail from "./Pages/User/CourseDetail";
import User from "./Pages/User/User";
import Resources from "./Pages/User/Resources";
import Quizzes from "./Pages/User/Quizzes";
import DashboardOutlet from "./Pages/User/DashboardOutlet";
// import Quiz from './Pages/Quiz';
import QuizAttempt from "./Pages/User/QuizAttempt";
import Results from "./Pages/User/Results";
import Simulations from "./Pages/User/Simulations";
import SubscriptionPlan from "./Components/SubscriptionPlan";
import { BillingAndPaymentsRoutes } from "./component-library/account-management/routes/BillingAndPayments";
import SubscriptionRestricted from "./component-library/billing-and-payments/subscriptions/SubscriptionRestricted";
import SubscriptionContextProvider from "./component-library/billing-and-payments/subscriptions/SubscriptionContextProvider";
import ProtectedRoute from "./component-library/account-management/authentication/ProtectedRoute";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminDashboardOutlet from "./Pages/Admin/AdminDashboardOutlet";
import CourseManagement from "./Pages/Admin/CourseManagement";
import UserManagement from "./Pages/Admin/UserManagement";
import Analytics from "./Pages/Admin/Analytics";
import ContentStudio from "./Pages/Admin/ContentStudio/ContentStudio";
import { LessonViewer } from "./Pages/LessonViewer";
import SubjectsView from "./Pages/User/SubjectsView";
import SubjectWorkspace from "./Pages/User/SubjectWorkspace";
import TopicWorkspace from "./Pages/User/TopicWorkspace";
import NotFound from "./Pages/NotFound";
import CurriculumBuilder from "./Pages/Admin/CurriculumBuilder";
import IngestionSandbox from "./Pages/Admin/IngestionSandbox";
import RequireRole from "./component-library/account-management/authentication/RequireRole";
import TeacherDashboardOutlet from "./Pages/Teacher/TeacherDashboardOutlet";
import TeacherDashboard from "./Pages/Teacher/TeacherDashboard";
import TeacherSubjectsView from "./Pages/Teacher/TeacherSubjectsView";
import TeacherSubjectWorkspace from "./Pages/Teacher/TeacherSubjectWorkspace";
import TeacherTopicWorkspace from "./Pages/Teacher/TeacherTopicWorkspace";
import TeacherClassesView from "./Pages/Teacher/TeacherClassesView";
import TeacherClassDetail from "./Pages/Teacher/TeacherClassDetail";
import { TeacherProfile } from "./Pages/Teacher/TeacherProfile";
import SchoolDashboardOutlet from "./Pages/School/SchoolDashboardOutlet";
import SchoolDashboard from "./Pages/School/SchoolDashboard";
import AcademicStructurePage from "./Pages/School/AcademicStructurePage";
import SchoolTeachersPage from "./Pages/School/SchoolTeachersPage";
import SchoolStudentsPage from "./Pages/School/SchoolStudentsPage";
import SchoolSubscriptionPage from "./Pages/School/SchoolSubscriptionPage";


function App() {
    const studentRoutes = {
        path: "student",
        element: (
            <RequireRole allowedRoles={["student", "platform_admin"]}>
                <DashboardOutlet />
            </RequireRole>
        ),
        children: [
            {
                index: true,
                element: (
                    <SubscriptionRestricted>
                        <Dashboard />
                    </SubscriptionRestricted>
                ),
            },
            {
                path: "home",
                element: (
                    <SubscriptionRestricted>
                        <Dashboard />
                    </SubscriptionRestricted>
                ),
            },
            {
                path: "subjects",
                element: (
                    <SubscriptionRestricted>
                        <SubjectsView />
                    </SubscriptionRestricted>
                ),
            },
            {
                path: "subject/:subjectId",
                element: (
                    <SubscriptionRestricted>
                        <SubjectWorkspace />
                    </SubscriptionRestricted>
                ),
            },
            {
                path: "topic/:topicId",
                element: (
                    <SubscriptionRestricted>
                        <TopicWorkspace />
                    </SubscriptionRestricted>
                ),
            },
            { path: "profile", element: <User /> },
            { path: "user", element: <User /> },
            {
                path: "resources",
                element: (
                    <SubscriptionRestricted requireFeature="access_downloads">
                        <Resources />
                    </SubscriptionRestricted>
                ),
            },
            {
                path: "quizzes",
                element: (
                    <SubscriptionRestricted requireFeature="access_assessments">
                        <Quizzes />
                    </SubscriptionRestricted>
                ),
            },
            {
                path: "simulations",
                element: (
                    <SubscriptionRestricted requireFeature="access_simulations">
                        <Simulations />
                    </SubscriptionRestricted>
                ),
            },
            { path: "quiz/:id", element: <QuizAttempt /> },
            {
                path: "results",
                element: (
                    <SubscriptionRestricted>
                        <Results />
                    </SubscriptionRestricted>
                ),
            },
            {
                path: "lesson-viewer/:topicId?",
                element: (
                    <SubscriptionRestricted>
                        <LessonViewer paginated={true} />
                    </SubscriptionRestricted>
                ),
            },
        ],
    };

    const teacherRoutes = {
        path: "teacher",
        element: (
            <RequireRole allowedRoles={["teacher", "platform_admin"]}>
                <TeacherDashboardOutlet />
            </RequireRole>
        ),
        children: [
            { index: true, element: <TeacherDashboard /> },
            { path: "subjects", element: <TeacherSubjectsView /> },
            { path: "subject/:subjectId", element: <TeacherSubjectWorkspace /> },
            { path: "topic/:topicId", element: <TeacherTopicWorkspace /> },
            { path: "classes", element: <TeacherClassesView /> },
            { path: "class/:streamId", element: <TeacherClassDetail /> },
            { path: "profile", element: <TeacherProfile /> },
            { path: "user", element: <TeacherProfile /> },
        ],
    };

    const schoolRoutes = {
        path: "school",
        element: (
            <RequireRole allowedRoles={["school_admin", "platform_admin"]}>
                <SchoolDashboardOutlet />
            </RequireRole>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <SubscriptionRestricted><SchoolDashboard /></SubscriptionRestricted> },
            { path: "academic-structure", element: <SubscriptionRestricted><AcademicStructurePage /></SubscriptionRestricted> },
            { path: "teachers", element: <SubscriptionRestricted><SchoolTeachersPage /></SubscriptionRestricted> },
            { path: "students", element: <SubscriptionRestricted><SchoolStudentsPage /></SubscriptionRestricted> },
            { path: "subscription", element: <SchoolSubscriptionPage /> },
            { path: "classes", element: <Navigate to="/school/academic-structure" replace /> },
            { path: "analytics", element: <Navigate to="/school/dashboard" replace /> },
            { path: "school", element: <Navigate to="/school/academic-structure" replace /> },
        ],
    };



    const adminDashboardRoutes = {
        path: "admin-dashboard",
        element: (
            <RequireRole allowedRoles={["platform_admin"]}>
                <AdminDashboardOutlet />
            </RequireRole>
        ),
        children: [
            {
                index: true,
                element: <AdminDashboard />
            },
            {
                path: "course-management",
                element: <CourseManagement />
            },
            {
                path: "user-management",
                element: <UserManagement />
            },
            {
                path: "analytics",
                element: <Analytics />
            },
            {
                path: "content-studio/:learningUnitId?",
                element: <ContentStudio />
            },
            {
                path: "curriculum-builder",
                element: <CurriculumBuilder />
            },
            {
                path: "ingestion-sandbox",
                element: <IngestionSandbox />
            },
        ]
    };

    const Router = createBrowserRouter([
        {
            path: "/",
            element: (
                <SubscriptionContextProvider>
                    <Outlet />
                </SubscriptionContextProvider>
            ),
            errorElement: <NotFound />,
            children: [
                {
                    index: true,
                    element: <Home />,
                },
                {
                    path: "contact",
                    element: <ContactUs />,
                },
                {
                    path: "login",
                    element: <Login />,
                },
                {
                    path: "register",
                    element: <Signup />,
                },
                {
                    path: "subscription",
                    element: <SubscriptionPlan />,
                },
                {
                    path: "coursedetails/:id",
                    element: <CourseDetail />,
                },
                {
                    path: "lesson-viewer/:topicId?",
                    element: (
                        <RequireRole allowedRoles={["student", "teacher", "platform_admin"]}>
                            <SubscriptionRestricted>
                                <LessonViewer paginated={true} />
                            </SubscriptionRestricted>
                        </RequireRole>
                    ),
                },
                {
                    path: "forgot-password",
                    element: <ForgotPassword />,
                },
                {
                    path: "reset-password/:token",
                    element: <ResetPassword />,
                },
                {
                    path: "unauthorized",
                    element: <Unauthorized />,
                },
                {
                    path: "onboarding",
                    element: (
                        <ProtectedRoute>
                            <StudentOnboarding />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "school-onboarding",
                    element: (
                        <ProtectedRoute>
                            <RequireRole allowedRoles={["school_admin"]}>
                                <SchoolOnboarding />
                            </RequireRole>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "role-selection",
                    element: (
                        <ProtectedRoute>
                            <RoleSelection />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "invitation/:token",
                    element: <InvitationAccept />,
                },
                { path: "dashboard", element: <Navigate to="/student" replace /> },
                { path: "dashboard/home", element: <Navigate to="/student/home" replace /> },
                { path: "dashboard/quiz/:id", element: <RedirectWithParams to="/student/quiz/:id" /> },
                { path: "dashboard/user", element: <Navigate to="/student/user" replace /> },
                { path: "dashboard/resources", element: <Navigate to="/student/resources" replace /> },
                { path: "dashboard/simulations", element: <Navigate to="/student/simulations" replace /> },
                { path: "dashboard/quizzes", element: <Navigate to="/student/quizzes" replace /> },
                { path: "dashboard/results", element: <Navigate to="/student/results" replace /> },
                { path: "dashboard/subject/:subjectId", element: <RedirectWithParams to="/student/subject/:subjectId" /> },
                { path: "plans", element: <Navigate to="/subscription" replace /> },
                { path: "plans/list", element: <Navigate to="/subscription" replace /> },
                { path: "admindashboard", element: <Navigate to="/admin-dashboard" replace /> },
                { path: "admin", element: <Navigate to="/admin-dashboard" replace /> },
                studentRoutes,
                teacherRoutes,
                schoolRoutes,
                adminDashboardRoutes,
                BillingAndPaymentsRoutes(),
                {
                    path: "*",
                    element: <NotFound />
                }
            ],
        },
    ]);

    return (
        <>
            {/* <UserProvider> */}
            <RouterProvider router={Router} />

            {/* <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />
            <Route path='/subscription' element={<SubscriptionPlan/>}/>
            <Route path='/admindashboard' element={<AdminDashboard/>}/>

            <Route path="/dashboard" element={<DashboardOutlet />}>
              <Route path='home' element={<Dashboard />} />
              <Route path="user" element={<User />} />
              <Route path="resources" element={<Resources />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="simulations" element={<Simulations />} />
              <Route path="quiz/:id" element={<QuizAttempt />} />
              <Route path="results" element={<Results />} />
              <Route index element={<Dashboard />} />
            </Route>
            <Route path="/coursedetails/:id" element={<CourseDetail />} />

          </Routes>
        </BrowserRouter> */}
            {/* </UserProvider> */}
        </>
    );
}

export default App;
