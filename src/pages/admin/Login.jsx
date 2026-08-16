import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
  const { signIn, session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (session) {
    navigate("/admin", { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      navigate("/admin", { replace: true });
    }
  }

  return (
    <div className="min-h-screen bg-ink-800 flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-sand-50 rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="font-display text-2xl text-ink-800 mb-1">Staff login</h1>

        <label className="block text-sm font-medium text-ink-700 mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-sand-200 rounded-lg px-3 py-2 mb-4 focus:border-pine-600 outline-none"
        />

        <label className="block text-sm font-medium text-ink-700 mb-1">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-sand-200 rounded-lg px-3 py-2 mb-4 focus:border-pine-600 outline-none"
        />

        {error && <p className="text-brick-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pine-700 text-sand-50 rounded-lg py-2.5 font-semibold hover:bg-pine-800 transition-colors disabled:opacity-60">
          {loading ? "Signing in…" : "Sign in"}
        </button>

      </form>
    </div>
  );
}
