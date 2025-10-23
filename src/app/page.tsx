"use client";
import Image from "next/image";
import HomePage from "./home/page";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MemberOnlyWrapper from "@/components/common/MemberOnlyWrapper";

export default function Home() {
  return (
    <MemberOnlyWrapper>
      <div>
        <Header/>
        <HomePage />
        <Footer/>
      </div>
    </MemberOnlyWrapper>
  );
}
