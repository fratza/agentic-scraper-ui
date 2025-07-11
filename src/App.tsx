import React, { useState, useEffect } from "react";
import "./styles/App.css";
import MainLayout from "./layouts/MainLayout";
import { Router } from "./routes";
import Loader from "./components/Loader";
import { ScraperProvider } from "./context/ScraperContext";

const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  // Hide loader after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app ${!loading ? "fade-in" : ""}`}>
      {loading && <Loader />}
      <ScraperProvider>
        <MainLayout>
          <Router />
        </MainLayout>
      </ScraperProvider>
    </div>
  );
};

export default App;
