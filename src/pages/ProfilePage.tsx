import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, Camera, Save, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileService } from "../services/profile.service";

export default function ProfilePage() {
  const { user, refreshProfile, role } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [photo, setPhoto] = useState<File | undefined>();
  const [preview, setPreview] = useState(user?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!photo) {
      setPreview(user?.avatar_url ?? "");
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo, user?.avatar_url]);

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5 MB.");
      return;
    }

    setError("");
    setPhoto(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await profileService.update({
        name: name.trim(),
        foto: photo,
      });

      await refreshProfile();
      setPhoto(undefined);
      setMessage("Perfil actualizado correctamente.");
    } catch {
      setError(
        "No se pudo actualizar el perfil. Comprueba los campos y los permisos de la API.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700"
        >
          <ArrowLeft size={18} /> Volver al panel
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
          <p className="mt-2 text-slate-500">
            Actualiza tu nombre y tu fotografía de perfil.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa del avatar"
                  className="size-24 rounded-2xl object-cover ring-4 ring-teal-50"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <UserRound size={36} />
                </div>
              )}

              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Camera size={18} />
                  Seleccionar fotografía
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="sr-only"
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  Imágenes de hasta 5 MB.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nombre completo
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Correo electrónico
              </label>
              <input
                value={user?.email ?? ""}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rol
              </label>
              <input
                value={role ?? ""}
                readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            {message && (
              <p
                role="status"
                className="rounded-xl bg-teal-50 p-3 text-sm text-teal-800"
              >
                {message}
              </p>
            )}

            <button
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              <Save size={18} />
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
