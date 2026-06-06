import { loginWithPassword } from "./server-actions";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <section className="section" style={{ width: "min(460px, 100%)" }}>
        <p className="eyebrow">Practice OS Cloud</p>
        <h1>Login</h1>
        <p className="muted">Use the email and password created for your office account.</p>
        {hasError ? <p className="badge high">Invalid email or password. Please check the Supabase user record.</p> : null}
        <form action={loginWithPassword} className="form">
          <label>Email<input name="email" type="email" required placeholder="staff@example.com" /></label>
          <label>Password<input name="password" type="password" required placeholder="Enter password" /></label>
          <button>Login</button>
        </form>
      </section>
    </main>
  );
}
