"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { MobileShell } from "@/components/layout/MobileShell";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const ready = useRequireAuth();
  const { user, updateProfile, changePassword } = useAuth();
  const { notify } = useToast();
  const router = useRouter();

  const [username, setUsername] = useState(user?.username ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  if (!ready) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.trim() === user?.username) return;
    setSavingProfile(true);
    try {
      await updateProfile(username.trim());
      notify("Profil diperbarui");
    } catch (err) {
      notify(extractMessage(err), "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      notify("Password diubah");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      notify(extractMessage(err), "error");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <AppHeader title="Profil" onBack={() => router.push("/dashboard")} />
      <MobileShell>
        <div className="space-y-5 py-5">
          <Card className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-sm text-text-muted">Email</span>
              <span className="text-sm font-medium text-text">
                {user?.email ?? "-"}
              </span>
            </div>
          </Card>

          <form className="space-y-4" onSubmit={saveProfile}>
            <h2 className="text-sm font-semibold text-text">Ubah Username</h2>
            <Field label="Username" required>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" loading={savingProfile}>
              Simpan Profil
            </Button>
          </form>

          <form className="space-y-4" onSubmit={savePassword}>
            <h2 className="text-sm font-semibold text-text">Ubah Password</h2>
            <Field label="Password saat ini" required>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="Password baru" required>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
              />
            </Field>
            <Button type="submit" variant="secondary" loading={savingPassword}>
              Ubah Password
            </Button>
          </form>
        </div>
      </MobileShell>
    </>
  );
}

function extractMessage(e: unknown): string {
  if (e && typeof e === "object" && "response" in e) {
    const resp = (e as { response?: { data?: { message?: string } } }).response;
    return resp?.data?.message ?? "Something went wrong";
  }
  return "Network error";
}
