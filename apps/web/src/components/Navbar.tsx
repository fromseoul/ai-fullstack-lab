"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 h-16 bg-gray-950 border-b border-gray-800">
      <Link href="/" className="text-white font-bold text-lg mr-6 hover:text-primary">
        AI Fullstack Lab
      </Link>

      <nav className="flex-1 flex items-center gap-4">
        {user ? (
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-sm transition-colors ${
              pathname === "/" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            대시보드
          </Link>
        ) : (
          <>
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === "/" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              홈
            </Link>
            <Link
              href="/login"
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === "/login" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                pathname === "/signup" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              회원가입
            </Link>
          </>
        )}
      </nav>

      {user ? (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          로그인
        </Link>
      )}
    </header>
  );
}
