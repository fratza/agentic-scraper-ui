import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import ExtractedDataTable from "../features/scraper/components/ExtractedDataTable";
import useScraper from "../features/scraper/hooks/useScraper";
import "../styles/TemplatePage.css";

// Sample product data interface
interface ProductData {
  id: number;
  title: string;
  price: string;
  category: string;
  rating: number;
  inStock: boolean;
}

// Import PrimeReact theme only for the data table components
// The rest of the page will use the app's theme variables

const TemplatePage: React.FC = () => {
  const { scrapedData, loading } = useScraper();

  // Sample data for demonstration if no real data is available
  const [demoData, setDemoData] = useState<ProductData[] | null>(null);

  useEffect(() => {
    // Create demo data if no scraped data is available
    if (!scrapedData) {
      const sampleData: ProductData[] = [
        {
          id: 1,
          title: "Product 1",
          price: "$19.99",
          category: "Electronics",
          rating: 4.5,
          inStock: true,
        },
        {
          id: 2,
          title: "Product 2",
          price: "$29.99",
          category: "Clothing",
          rating: 3.8,
          inStock: true,
        },
        {
          id: 3,
          title: "Product 3",
          price: "$9.99",
          category: "Books",
          rating: 4.2,
          inStock: false,
        },
        {
          id: 4,
          title: "Product 4",
          price: "$49.99",
          category: "Electronics",
          rating: 4.7,
          inStock: true,
        },
        {
          id: 5,
          title: "Product 5",
          price: "$15.99",
          category: "Home & Kitchen",
          rating: 4.0,
          inStock: true,
        },
      ];
      setDemoData(sampleData);
    }
  }, [scrapedData]);

  // Use scraped data if available, otherwise use demo data
  const displayData = scrapedData || demoData;

  return (
    <motion.div
      className="template-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <h1 className="page-title">Data Results Table</h1>

        <section className="content-section">
          <Card className="intro-card">
            <h2>Welcome to the Data Results Page</h2>
            <p>
              This page displays the data results from the scraper. The table
              below shows either actual scraped data or sample demonstration
              data if no scraping has been performed yet.
            </p>
          </Card>
        </section>

        <section className="content-section">
          {loading ? (
            <Card className="info-card">
              <div className="loading-indicator">
                <i
                  className="pi pi-spin pi-spinner"
                  style={{ fontSize: "2rem" }}
                ></i>
                <p>Loading data...</p>
              </div>
            </Card>
          ) : displayData ? (
            <div className="data-table-wrapper">
              <ExtractedDataTable extractedData={displayData} />
            </div>
          ) : (
            <Card className="info-card">
              <p>No data available. Please run a scraper to get data.</p>
            </Card>
          )}
        </section>

        <div className="page-actions">
          <Button
            icon="pi pi-arrow-left"
            label="Back to Home"
            className="p-button-text"
            onClick={() => (window.location.href = "/")}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TemplatePage;
