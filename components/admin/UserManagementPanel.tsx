"use client";

import { useActionState, useMemo } from "react";

import { createUserAdmin, deleteUser, resetUserPassword } from "@/app/(admin)/admin-dashboard/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { UserRow } from "@/lib/users";

type ActionResult = {
  error?: string;
  success?: boolean;
};

const initialState: ActionResult = {};

export function UserManagementPanel({
  users,
  translations,
}: {
  users: UserRow[];
  translations: Dictionary;
}) {
  const [state, action] = useActionState<ActionResult, FormData>(createUserAdmin, initialState);
  const resetAction = resetUserPassword.bind(null, null) as unknown as (formData: FormData) => Promise<void>;
  const deleteAction = deleteUser.bind(null, null) as unknown as (formData: FormData) => Promise<void>;

  const message = useMemo(() => {
    if (state?.error) return state.error;
    if (state?.success) return translations.usersAdmin.success;
    return null;
  }, [state, translations.usersAdmin.success]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {translations.usersAdmin.title}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          {translations.usersAdmin.description}
        </p>
      </div>

      <form action={action} className="rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">
          {translations.usersAdmin.newUser}
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            name="name"
            placeholder={translations.usersAdmin.name}
            required
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <input
            type="email"
            name="email"
            placeholder={translations.usersAdmin.email}
            required
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            type="password"
            name="password"
            placeholder={translations.usersAdmin.password}
            required
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
          <select
            name="locale"
            defaultValue="zh"
            className="rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {translations.usersAdmin.create}
        </button>
        {message && (
          <p
            className={`mt-2 text-sm ${
              state?.error ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-4 py-3 font-medium">{translations.usersAdmin.name}</th>
              <th className="px-4 py-3 font-medium">{translations.usersAdmin.email}</th>
              <th className="px-4 py-3 font-medium">{translations.usersAdmin.locale}</th>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">{translations.usersAdmin.created}</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-300">
                  {translations.usersAdmin.empty}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{user.name}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{user.email}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">{user.locale}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{user.id}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                    {new Date(user.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <form action={resetAction} className="flex flex-col gap-2 md:flex-row">
                        <input type="hidden" name="user_id" value={user.id} />
                        <input
                          type="password"
                          name="password"
                          placeholder={translations.usersAdmin.password}
                          required
                          className="flex-1 rounded-2xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                        <button
                          type="submit"
                          className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          {translations.usersAdmin.reset}
                        </button>
                      </form>
                      <form
                        action={deleteAction}
                        onSubmit={(event) => {
                          // eslint-disable-next-line no-alert
                          if (!window.confirm(translations.usersAdmin.delete + "?")) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input type="hidden" name="user_id" value={user.id} />
                        <button
                          type="submit"
                          className="w-full rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-500/10"
                        >
                          {translations.usersAdmin.delete}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
