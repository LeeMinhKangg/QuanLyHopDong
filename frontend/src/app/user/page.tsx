import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1 className="text-red-500 text-[30px]">HDD</h1>
      <div>
        <Link className="text-[50px]" href={'/facebook'}>Facebook</Link>
      </div>
    </div>
  );
}
