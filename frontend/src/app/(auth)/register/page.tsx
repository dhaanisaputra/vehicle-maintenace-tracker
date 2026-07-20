"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function RegisterPage() {
  const { register, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="mx-auto flex min-h-screen max-w-content flex-col px-5 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text">
          Vehicle Maintenance
        </h1>
        <p className="mt-1 text-sm text-text-muted">Buat akun baru</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          register(username, email, password);
        }}
      >
        <Field label="Username" required>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" required hint="Minimal 6 karakter">
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Sudah punya akun?{" "}
        <a href="/login" className="font-medium text-primary">
          Masuk
        </a>
      </p>
    </main>
  );
}
