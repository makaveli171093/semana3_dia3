import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  Camera,
  Pencil,
  Plus,
  RefreshCw,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { UserProfile } from "../types/auth";
import { profileService } from "../services/profile.service";
import {
  usersService,
  type CreateUserData,
  type UpdateUserData,
} from "../services/users.service";
import axios from "axios";

type UserForm = {
  name: string;
  email: string;
  role: "admin" | "cliente";
  password: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  role: "cliente",
  password: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setUsers(await usersService.list());
    } catch {
      setError(
        "No se pudo obtener la lista de usuarios. Verifica los permisos de ADMIN.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function startEdit(user: UserProfile) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase() === "admin" ? "admin" : "cliente",
      password: "",
    });
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const name = form.name.trim();
    const email = form.email.trim();
    const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

    if (!name) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (!emailPattern.test(email)) {
      setError("Introduce un correo electrónico válido.");
      return;
    }

    if (form.role !== "admin" && form.role !== "cliente") {
      setError("Selecciona un rol válido.");
      return;
    }

    if (!editing && form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (editing && form.password.length > 0 && form.password.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        const payload: UpdateUserData = {
          name,
          email,
          role: form.role,
        };

        // Si se deja vacía, el backend conserva la contraseña actual.
        if (form.password.length > 0) payload.password = form.password;

        await usersService.update(editing.id, payload);
        setMessage("Usuario actualizado correctamente.");
      } else {
        const payload: CreateUserData = {
          name,
          email,
          role: form.role,
          password: form.password,
        };

        await usersService.create(payload);
        setMessage("Usuario creado correctamente.");
      }

      cancelEdit();
      await loadUsers();
    } catch (error: unknown) {
      console.error("Error al guardar usuario:", error);

      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        const message = error.response?.data?.message;

        setError(
          typeof detail === "string"
            ? detail
            : typeof message === "string"
              ? message
              : error.response
                ? `Error HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`
                : error.message || "No se pudo conectar con la API.",
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(String(error));
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatar(user: UserProfile, file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5 MB.");
      return;
    }

    setUploadingId(user.id);
    setError("");
    setMessage("");

    try {
      const avatarUrl = await profileService.uploadAvatar(file);

      await usersService.update(user.id, {
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase() === "admin" ? "admin" : "cliente",
        avatar_url: avatarUrl,
      });

      setMessage(`Fotografía actualizada para ${user.name}.`);
      await loadUsers();
    } catch {
      setError(
        "La subida o actualización de la fotografía falló. Confirma que /users/{user_id} admite avatar_url en su esquema de actualización.",
      );
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft size={18} /> Volver al panel
        </Link>

        <header className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-teal-700">
              <Users size={22} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Administración
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Usuarios
            </h1>
            <p className="mt-2 text-slate-500">
              Crea cuentas, actualiza datos y administra roles.
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setError("");
              setMessage("");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Plus size={18} /> Crear usuario
          </button>
        </header>

        {(error || message) && (
          <div
            role={error ? "alert" : "status"}
            className={`mt-6 rounded-xl p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-teal-50 text-teal-800"}`}
          >
            {error || message}
          </div>
        )}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {editing ? `Editar: ${editing.name}` : "Crear una cuenta"}
            </h2>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Limpiar formulario"
            >
              <X size={19} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <div>
              <label
                htmlFor="user-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nombre
              </label>
              <input
                id="user-name"
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="user-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo
              </label>
              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                required
                className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label
                htmlFor="user-role"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Rol
              </label>
              <select
                id="user-role"
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role: event.target.value as UserForm["role"],
                  })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-teal-700"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="user-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                {editing ? "Nueva contraseña (opcional)" : "Contraseña"}
              </label>
              <input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                required={!editing}
                minLength={editing && !form.password ? undefined : 8}
                autoComplete="new-password"
                placeholder={
                  editing
                    ? "Dejar en blanco para conservar"
                    : "Mínimo 8 caracteres"
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-teal-700"
              />
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-4">
              <button
                disabled={saving}
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {saving
                  ? "Guardando…"
                  : editing
                    ? "Guardar cambios"
                    : "Crear usuario"}
              </button>

              {editing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">Usuarios registrados</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading ? "Cargando…" : `${users.length} usuarios`}
              </p>
            </div>
            <button
              onClick={() => void loadUsers()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw size={16} /> Actualizar
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-slate-500">
              Consultando la API…
            </p>
          ) : users.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              No hay usuarios para mostrar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Usuario</th>
                    <th className="px-5 py-4 font-semibold">Correo</th>
                    <th className="px-5 py-4 font-semibold">Rol</th>
                    <th className="px-5 py-4 font-semibold">
                      Fecha de registro
                    </th>
                    <th className="px-5 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="size-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-800">
                              {user.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-slate-800">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${user.role.toLowerCase() === "admin" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(user)}
                            title="Editar usuario"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Pencil size={16} />
                          </button>
                          <label
                            title="Subir fotografía (solo administrador)"
                            className={`cursor-pointer rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 ${uploadingId === user.id ? "opacity-50" : ""}`}
                          >
                            <Camera size={16} />
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              disabled={uploadingId !== null}
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = "";
                                void handleAvatar(user, file);
                              }}
                            />
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
