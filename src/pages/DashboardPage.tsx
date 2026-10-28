import { LogOut, ShieldCheck, UserRound, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const initials = user?.name
    ?.trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-teal-700 text-white">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">FUNVAL</p>
              <p className="text-xs text-slate-500">Gestión de usuarios</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <p className="text-sm font-semibold text-teal-700">PANEL DE CONTROL</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Hola, {user?.name}
        </h1>
        <p className="mt-3 text-slate-500">
          Has iniciado sesión correctamente. Estas son tus opciones disponibles.
        </p>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-5">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`Fotografía de ${user.name}`}
                  className="size-20 rounded-2xl object-cover ring-4 ring-teal-50"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-bold text-teal-800 ring-4 ring-teal-50">
                  {initials || <UserRound size={30} />}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold text-slate-900">
                  {user?.name}
                </h2>
                <p className="mt-1 break-all text-sm text-slate-500">
                  {user?.email}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-teal-800">
                  {role}
                </span>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-5">
              <p className="text-sm text-slate-500">Identificador de usuario</p>
              <p className="mt-1 font-semibold text-slate-800">{user?.id}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <UserRound size={25} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-slate-900">Mi perfil</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tus datos proceden de la sesión autenticada en FUNVAL.
            </p>
            <Link
              to="/profile"
              className="mt-5 inline-flex rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Editar mi perfil
            </Link>
          </article>

          {role === "admin" && (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
              <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                <Users size={25} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Administración de usuarios
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Consulta y administra las cuentas registradas.
              </p>
              <Link
                to="/users"
                className="mt-5 inline-flex rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Gestionar usuarios
              </Link>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
