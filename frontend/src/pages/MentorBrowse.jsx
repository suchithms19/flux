import ProfileCard from "@/components/common/MentorCard"
import Header from '../components/common/Header';
import { useState } from "react";
import { useEffect } from "react";
  

export default function MentorBrowse() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsVisible(true);
    }, 100);
  }, []);
  return <div className="font-poppins pt-24 px-4">
    <Header isVisible={isVisible} />
    <ProfileCard/>
    
    
   
  </div>
}