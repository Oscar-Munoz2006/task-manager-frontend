import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskPage from "./pages/TaskPage";
import TaskFormPage from "./pages/TaskFormPage";
import Navigation from "./components/Navigation";
import Login from "./pages/login";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Sidebar from "./components/Sidebar";
import { FilterProvider } from "./contexts/FilterContext";

function App() {
  return (
    <FilterProvider>
      <BrowserRouter>
        <div>
          <Navbar />
          <Sidebar/>
          <Navigation />
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
          </Routes>
        </div>
      </BrowserRouter>
    </FilterProvider>
  );
}

export default App;
