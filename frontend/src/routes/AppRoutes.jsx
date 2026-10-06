import { Navigate, Route, Routes } from "react-router-dom";

// ==============================
// AUTH
// ==============================

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// ==============================
// LAYOUTS
// ==============================

import TeacherLayout from "../layouts/TeacherLayout";
import StudentLayout from "../layouts/StudentLayout";

// ==============================
// COMMON
// ==============================

import ProtectedRoute from "./ProtectedRoute";
import LandingPage from "../pages/LandingPage";

// ==============================
// TEACHER
// ==============================

import TeacherDashboard from "../pages/teacher/TeacherDashboard";

import Problems from "../pages/teacher/Problems";
import CreateProblem from "../pages/teacher/CreateProblem";
import ProblemDetails from "../pages/teacher/ProblemDetails";
import EditProblem from "../pages/teacher/EditProblem";

import Tests from "../pages/teacher/Tests";
import CreateTest from "../pages/teacher/CreateTest";
import TestDetails from "../pages/teacher/TestDetails";
import ParticipantDetails from "../pages/teacher/ParticipantDetails";

// ==============================
// STUDENT
// ==============================

import StudentDashboard from "../pages/student/StudentDashboard";
import JoinTest from "../pages/student/JoinTest";
import MyResults from "../pages/student/MyResults";
import TestResult from "../pages/student/TestResult";
import TestInstructions from "../pages/student/TestInstructions";
import CodingAssessment from "../pages/student/CodingAssessment";
import Profile from "../pages/auth/Profile";
import AllStudent from "../pages/teacher/AllStudent";
import StudentDetails from "../pages/teacher/StudentDetails";
import VerificationRequests from "../pages/teacher/VerificationRequests";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ============================== */}
      {/* PUBLIC */}
      {/* ============================== */}

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* ============================== */}
      {/* TEACHER */}
      {/* ============================== */}

      <Route
        path="/teacher"
        element={
          <ProtectedRoute roles={["teacher", "admin"]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route
  path="/teacher/verification-requests"
  element={<VerificationRequests />}
/>
        <Route path="all_students" element={<AllStudent />} />
        <Route
  path="students/:id"
  element={<StudentDetails />}
/>
        {/* DASHBOARD */}

        <Route index element={<TeacherDashboard />} />

        {/* PROFILE */}

        <Route path="profile" element={<Profile />} />

        {/* ============================== */}
        {/* PROBLEMS */}
        {/* ============================== */}

        <Route path="problems" element={<Problems />} />

        <Route path="problems/create" element={<CreateProblem />} />

        <Route path="problems/:id" element={<ProblemDetails />} />

        <Route path="problems/:id/edit" element={<EditProblem />} />

        {/* ============================== */}
        {/* TESTS */}
        {/* ============================== */}

        <Route path="tests" element={<Tests />} />

        <Route path="tests/create" element={<CreateTest />} />

        <Route path="tests/:id" element={<TestDetails />} />

<Route
  path="/teacher/tests/:testId/participants/:studentId"
  element={
    <ParticipantDetails />
  }
/>
      </Route>

      {/* ============================== */}
      {/* STUDENT */}
      {/* ============================== */}

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        {/* DASHBOARD */}

        <Route index element={<StudentDashboard />} />

        {/* PROFILE */}

        <Route path="profile" element={<Profile />} />

        {/* JOIN TEST */}

        <Route path="join" element={<JoinTest />} />

        {/* RESULTS */}

        <Route path="results" element={<MyResults />} />

        <Route path="results/:testId" element={<TestResult />} />

        {/* TEST INSTRUCTIONS */}

        <Route path="tests/:id" element={<TestInstructions />} />
      </Route>

      {/* ============================== */}
      {/* CODING ASSESSMENT */}
      {/* Outside StudentLayout */}
      {/* ============================== */}

      <Route
        path="/student/tests/:id/code"
        element={
          <ProtectedRoute roles={["student"]}>
            <CodingAssessment />
          </ProtectedRoute>
        }
      />

      {/* ============================== */}
      {/* DEFAULT */}
      {/* ============================== */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
