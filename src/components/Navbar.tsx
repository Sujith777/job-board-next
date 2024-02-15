import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <header className="shadow-sm">
      <nav className="max-w-5xl m-auto px-3 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src={logo} alt="logo" height={40} width={40} />
          <span className="text-xl font-bold tracking-tight">Jobinator</span>
        </Link>
        <Button asChild>
          <Link href="/jobs/new">Post a job</Link>
        </Button>
      </nav>
    </header>
  );
}
