"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";


export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "create-admin">("signin");
  const [inviteToken, setInviteToken] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [info, setInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    if (mode === "signin") {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      setLoading(false);
      if (res?.error) {
        setError("Invalid email or password");
      } else {
        window.location.href = "/admin";
      }
      return;
    }

    // Create admin flow (guarded by invite token, runs via server API)
    try {
      if (!inviteToken) {
        setLoading(false);
        setError("Invite code is required");
        return;
      }
      if (!email || !password) {
        setLoading(false);
        setError("Email and password are required");
        return;
      }
      if (password !== confirmPassword) {
        setLoading(false);
        setError("Passwords do not match");
        return;
      }
      const resp = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, inviteToken }),
      });
      const json = await resp.json();
      setLoading(false);
      if (!resp.ok || !json?.success) {
        setError(json?.error || "Failed to create admin account");
        return;
      }
      setInfo("Admin account created. You can now sign in.");
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
      setInviteToken("");
    } catch (e) {
      setLoading(false);
      setError("Unexpected error while creating admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-800">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md space-y-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-indigo-700">{mode === "signin" ? "Sign In" : "Create Admin"}</h1>
          <button
            type="button"
            onClick={() => { setError(""); setInfo(""); setMode(mode === "signin" ? "create-admin" : "signin"); }}
            className="text-sm text-indigo-700 hover:underline"
          >
            {mode === "signin" ? "Create admin" : "Back to sign in"}
          </button>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 placeholder-gray-600"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 placeholder-gray-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {mode === "create-admin" && (
          <>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 placeholder-gray-600"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Admin Invite Code</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900 placeholder-gray-600"
                value={inviteToken}
                onChange={e => setInviteToken(e.target.value)}
                required
              />
            </div>
          </>
        )}
        {error && <div className="text-red-600 text-center font-medium">{error}</div>}
        {info && <div className="text-green-600 text-center font-medium">{info}</div>}
  {/* Simple dev hint removed for a clean signin page in preparation for production */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-200"
          disabled={loading}
        >
          {loading ? (mode === "signin" ? "Signing in..." : "Creating...") : (mode === "signin" ? "Sign In" : "Create Admin")}
        </button>
      </form>
    </div>
  );
}
