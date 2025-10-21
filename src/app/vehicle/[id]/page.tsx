import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import CarDetailPage from "../../../components/CarDetailpage/CarDetailPage";
import SharedBackground from "@/components/Homepage/SharedBackground";

export default function CarPage({ params }: { params: { id: string } }) {
  return (
    <>
      <SharedBackground>
        <Header />
        <CarDetailPage />
      </SharedBackground>
      <Footer />
    </>
  );
}
