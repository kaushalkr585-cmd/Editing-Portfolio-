import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Hero from '../components/sections/Hero';
import FeaturedShowreel from '../components/sections/FeaturedShowreel';
import PortfolioGallery from '../components/sections/PortfolioGallery';
import Services from '../components/sections/Services';
import AboutMe from '../components/sections/AboutMe';
import EditingProcess from '../components/sections/EditingProcess';
import AIAssistant from '../components/sections/AIAssistant';
import Pricing from '../components/sections/Pricing';
import Testimonials from '../components/sections/Testimonials';
import FAQ from '../components/sections/FAQ';
import Contact from '../components/sections/Contact';
import Footer from '../components/common/Footer';

export const HomePage = () => {
  const [contactPrefill, setContactPrefill] = useState(null);

  const handleInquiryTransfer = (data) => {
    setContactPrefill(data);
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F5F5F5] font-kanit selection:bg-[#B600A8] selection:text-white">
      <Navbar />
      <Hero />
      <FeaturedShowreel />
      <PortfolioGallery onSelectProjectForInquiry={handleInquiryTransfer} />
      <Services onSelectServiceForInquiry={handleInquiryTransfer} />
      <AboutMe />
      <EditingProcess />
      <AIAssistant
        onTransferBriefToContact={handleInquiryTransfer}
        onSelectProject={(proj) => {
          // Open details or scroll
        }}
      />
      <Pricing onSelectPackageForInquiry={handleInquiryTransfer} />
      <Testimonials />
      <FAQ />
      <Contact prefillData={contactPrefill} />
      <Footer />
    </div>
  );
};

export default HomePage;
