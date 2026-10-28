import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { user, login, role, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Verificando sesión…
      </main>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(role ? "/dashboard" : "/dashboard", { replace: true });
    } catch {
      setError(
        "No se pudo iniciar sesión. Verifica tus credenciales y la conexión con la API.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-700 text-white">
              <ShieldCheck size={26} />
            </div>
            <div>
              <p className="font-bold text-slate-900">FUNVAL</p>
              <p className="text-sm text-slate-500">Gestión de usuarios</p>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Bienvenido de nuevo
          </h1>
          <p className="mt-3 text-slate-500">
            Ingresa tus credenciales para continuar.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
                <Mail size={19} className="shrink-0 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@correo.com"
                  className="min-w-0 flex-1 py-3.5 text-base outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100">
                <LockKeyhole size={19} className="shrink-0 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contraseña"
                  className="min-w-0 flex-1 py-3.5 text-base outline-none"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-teal-700 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? "Iniciando sesión…" : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </section>

      <aside className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <div className="text-sm font-semibold tracking-widest text-teal-300">
          FUNVAL WORKSPACE
        </div>
        <div className="max-w-lg">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-white/10 text-teal-300">
            <ShieldCheck size={30} />
          </div>
          <h2 className="text-4xl font-bold leading-tight">
            Tu espacio de trabajo, seguro y organizado.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Accede a tu perfil y a las herramientas disponibles según tu rol.
          </p>
        </div>
        <p className="text-sm text-slate-400">
          Autenticación y permisos gestionados por la API FUNVAL.
        </p>
      </aside>
    </main>
  );
}
