import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { MainLayoutProps } from "../model";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default MainLayout;
