"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="mx-auto flex min-h-screen max-w-content flex-col px-5 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text">
          Vehicle Maintenance
        </h1>
        <p className="mt-1 text-sm text-text-muted">Masuk ke akun kamu</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          login(email, password);
        }}
      >
        <Field label="Email" required>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Field label="Password" required>
          <PasswordInput
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" fullWidth loading={loading}>
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        Belum punya akun?{" "}
        <a href="/register" className="font-medium text-primary">
          Daftar
        </a>
      </p>
    </main>
  );
}
