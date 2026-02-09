import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    // Redirect to Student App running on port 3001
    window.location.href = "http://localhost:3001";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2">OneStop Student Ecosystem</h1>
        <p className="text-blue-100">Loading your app...</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
