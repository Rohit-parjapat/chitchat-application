"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-blue-500 to-purple-600 p-4">
      <h1 className="text-white text-4xl font-bold mb-8">Welcome to ChatApp</h1>
      <p className="text-blue-100 mb-12 max-w-md text-center">
        Connect with your friends instantly. Register or login to get started.
      </p>

      <div className="space-x-6">
        <button
          onClick={() => router.push("/register")}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition"
        >
          Register
        </button>

        <button
          onClick={() => router.push("/login")}
          className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-800 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
