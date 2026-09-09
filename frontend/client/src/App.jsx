import { BrowserRouter, Routes, Route } from "react-router-dom";


import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import TaxInvoice from "./pages/TaxInvoice";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookSlot from "./pages/BookSlot";
import Queue from "./pages/Queue";
import QueueSelector from "./pages/QueueSelector";
import Procurement from "./pages/Procurement";
import Payments from "./pages/Payments";
import AdminRoute from "./components/AdminRoute";
import AdminQueue from "./pages/AdminQueue";
import AdminCentres from "./pages/AdminCentres";
import AdminProcurement from "./pages/AdminProcurement";
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/queue"
          element={
            <AdminRoute>
              <AdminQueue />
            </AdminRoute>
          }
        />
         <Route
  path="/admin/centres"
  element={
    <ProtectedRoute>
      <AdminCentres />
    </ProtectedRoute>
  }
/>
        <Route
          path="/admin/procurement"
          element={
            <ProtectedRoute>
              <AdminProcurement />
            </ProtectedRoute>
          }
        />
        
<Route
  path="/admin/centres"
  element={
    <AdminRoute>
      <AdminCentres />
    </AdminRoute>
  }
/>
<Route
  path="/payment-invoice/:id"
  element={<TaxInvoice />}
/>



        <Route
          path="/book-slot"
          element={
            <ProtectedRoute>
              <BookSlot />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue"
          element={
            <ProtectedRoute>
              <QueueSelector />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue/:centreId"
          element={
            <ProtectedRoute>
              <Queue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/procurement"
          element={
            <ProtectedRoute>
              <Procurement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
