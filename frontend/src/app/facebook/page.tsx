"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  const tang = () => {
    setCount(count + 1);
  };
  return (
    <div>
     {count} 
     <button onClick={tang}>Tang</button>
    </div>
  );
}
