import { loginWithEmail } from "./server-actions";

export default function LoginPage() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="section" style={{ width: "min(460px, 100%)" }}>
        <p className="eyebrow">Practice OS Cloud</p>
        <h1>Login</h1>
        <p className="muted">Enter your office email. Supabase will send a secure magic link.</p>
        <form action={loginWithEmail} className="form">
          <label>Email<input name="email" type="email" required placeholder="staff@example.com" /></label>
          <button>Send Login Link</button>
        </form>
      </section>
    </main>
  );
}
