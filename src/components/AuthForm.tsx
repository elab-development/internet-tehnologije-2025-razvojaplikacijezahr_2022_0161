"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useAuth } from "./AuthProvider";

export default function AuthForm() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Neispravno korisničko ime i lozinka.");
        return;
      }
      await refresh();
      router.push("/");
      router.refresh();
    } catch {
      setError("Nije moguće otvoriti početnu stranu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <Input
        label="Korisničko ime"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Unesite korisničko ime"
        required
      />
      <Input
        label="Lozinka"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Unesite lozinku"
        required
      />
      {error && <p className="input-error-msg">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? "Prijavljivanje..." : "Prijavi se"}
      </Button>
    </form>
  );
}
