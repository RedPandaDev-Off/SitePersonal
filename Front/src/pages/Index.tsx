import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Services from "../components/Services";
import Testimonials from "../components/Testimonials";
import Portfolio from "../components/Portfolio";
import Process from "../components/Process";
import QuoteForm from "../components/QuoteForm";
import Footer from "../components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services />
      <Portfolio/>
      <Testimonials/>
      <Process />
      <QuoteForm />
      <Footer />
    </main>
  );
};

export default Index;
