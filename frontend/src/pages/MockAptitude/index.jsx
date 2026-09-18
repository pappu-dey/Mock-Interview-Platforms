import React, { useState, useEffect } from "react";
import MockAptitude from "./MockAptitude";
import AptitudeExam from "./AptitudeExam";
import ExamInstructionsModal from "./ExamInstructionsModal";
import MobileUnsupported from "./MobileUnsupported";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const isSmall = window.innerWidth < 768;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    return isSmall || isMobileDevice;
  });

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(isSmall || isMobileDevice);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default function MockAptitudeWrapper() {
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeExam, setActiveExam] = useState(null);

  // If on mobile device or small screen, do not load exam
  if (isMobile) {
    return <MobileUnsupported />;
  }

  if (activeExam) {
    return (
      <AptitudeExam
        category={activeExam}
        onExit={() => {
          setActiveExam(null);
          setSelectedCategory(null);
        }}
      />
    );
  }

  return (
    <>
      <MockAptitude
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        onStartExam={(cat) => setSelectedCategory(cat)}
      />
      {selectedCategory && (
        <ExamInstructionsModal
          category={selectedCategory}
          onCancel={() => setSelectedCategory(null)}
          onConfirm={(cat) => {
            setSelectedCategory(null);
            setActiveExam(cat);
          }}
        />
      )}
    </>
  );
}
