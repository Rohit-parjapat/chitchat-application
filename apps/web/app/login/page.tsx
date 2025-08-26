"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const res = await api.get("/users/me");
        if (res.status === 200 && res.data) {
          router.push("/dashboard");
        }
      } catch (err) {
        // User not logged in, do nothing
      }
    };
    checkCurrentUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/users/login", form);
      if (res.status !== 200) {
        setError( res.data.message || "Login failed.");
        return;
      }

      // Redirect after successful login
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="mt-2 w-full py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
        >
          Login
        </button>
      </form>
      <div className="mt-6 text-center">
        <span className="text-gray-600">Don't have an account?</span>
        <button
          type="button"
          className="ml-2 text-green-600 hover:underline font-semibold cursor-pointer"
          onClick={() => router.push('/register')}
        >
          Register
        </button>
      </div>
    </div>
  );
}
