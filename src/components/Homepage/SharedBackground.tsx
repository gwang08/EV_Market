"use client";
import React from "react";

interface SharedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

function SharedBackground({ children, className = "" }: SharedBackgroundProps) {
  return (
    <div
      className={`relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 ${className}`}
    >
      {/* Elegant background orbs */}
      <div className="absolute top-0 right-0 w-[500px] md:w-[900px] h-[500px] md:h-[900px] bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute top-[50vh] left-0 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-indigo-200/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div className="absolute top-[25vh] left-1/2 -translate-x-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[10vh] right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-200/20 rounded-full blur-3xl"></div>

      {/* Enhanced geometric patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #3b82f6 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        {/* Floating circles - Hidden on mobile */}
        <div className="hidden md:block absolute top-20 right-1/4 w-64 h-64 border border-blue-300 rounded-full animate-pulse"></div>
        <div
          className="hidden md:block absolute top-[60vh] left-1/5 w-48 h-48 border border-indigo-300 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        {/* Diagonal lines - Hidden on mobile */}
        <div className="hidden md:block absolute top-1/4 left-1/3 w-40 h-0.5 bg-blue-300 rotate-45"></div>
        <div className="hidden md:block absolute top-[70vh] right-1/4 w-32 h-0.5 bg-indigo-300 -rotate-45"></div>

        {/* Small decorative elements */}
        <div className="absolute top-[30vh] right-1/3 w-3 md:w-4 h-3 md:h-4 bg-blue-400 rounded-full"></div>
        <div className="absolute top-[55vh] left-1/3 w-2 md:w-3 h-2 md:h-3 bg-indigo-400 rounded-full"></div>
        <div className="absolute top-[80vh] left-1/4 w-1.5 md:w-2 h-1.5 md:h-2 bg-purple-400 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default SharedBackground;
