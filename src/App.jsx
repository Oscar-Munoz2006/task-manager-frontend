import { BrowserRouter, Routes, Route } from "react-router-dom";
import TaskPage from "./pages/TaskPage";
import TaskFormPage from "./pages/TaskFormPage";
import Navigation from "./components/Navigation";
import Login from "./pages/login";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import { Toaster } from "react-hot-toast";
import TaskCalendar from "./components/TaskCalendar";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Navigation />
        <Toaster position="bottom-right" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks-create"
            element={
              <PrivateRoute>
                <TaskFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <PrivateRoute>
                <TaskFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <TaskCalendar />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;