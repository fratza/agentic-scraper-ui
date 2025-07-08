import React, { useState } from "react";
import "./styles/App.css";
import MainLayout from "./layouts/MainLayout";
import { Router } from "./routes";
import Loader from "./components/Loader";

function App() {
  const [loading, setLoading] = useState(true);

  // Hide loader after page load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app ${!loading ? "fade-in" : ""}`}>
      {loading && <Loader />}
      <MainLayout>
        <Router />
      </MainLayout>
    </div>
  );
}

export default App;
