import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import PinDetailPage from "../../../components/PinDetailpage/PinDetailPage";
import SharedBackground from "@/components/Homepage/SharedBackground";

export default function PinPage({ params }: { params: { id: string } }) {
  return (
    <>
      <SharedBackground>
        <Header />
        <PinDetailPage />
      </SharedBackground>
      <Footer />
    </>
  );
}
