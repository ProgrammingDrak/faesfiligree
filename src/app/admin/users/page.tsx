"use client";

import { useState, useEffect, useActionState, useCallback } from "react";
import {
  createAdminUserAction,
  deleteAdminUserAction,
} from "@/lib/actions/auth";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createState, createAction, isCreating] = useActionState(
    createAdminUserAction,
    null
  );

  const loadUsers = useCallback(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (createState?.success) {
      loadUsers();
      setShowForm(false);
    }
  }, [createState, loadUsers]);

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Delete admin account for ${userName}?`)) return;
    setDeleteError(null);
    const result = await deleteAdminUserAction(userId);
    if (result.error) {
      setDeleteError(result.error);
    } else {
      loadUsers();
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-3xl text-warm-white">Admin Users</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {deleteError && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
          {deleteError}
        </div>
      )}

      {showForm && (
        <div className="bg-warm-white/5 border border-warm-white/10 rounded-lg p-4 mb-6">
          <h2 className="text-warm-white font-medium mb-4">
            Create Admin Account
          </h2>

          {createState?.success && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm mb-4">
              {createState.success}
            </div>
          )}

          <form action={createAction} className="space-y-3">
            <div>
              <label className="block text-sm text-warm-white/70 mb-1">
                Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-warm-white/70 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-warm-white/70 mb-1">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
                placeholder="Min 8 characters"
              />
            </div>

            {createState?.error && (
              <p className="text-rose-gold text-sm">{createState.error}</p>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 bg-copper hover:bg-copper-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between bg-warm-white/5 border border-warm-white/10 rounded-lg p-4"
          >
            <div>
              <p className="text-warm-white font-medium">{user.name}</p>
              <p className="text-warm-white/50 text-sm">{user.email}</p>
            </div>
            <button
              onClick={() => handleDelete(user.id, user.name)}
              className="text-warm-white/30 hover:text-red-400 text-sm transition-colors"
            >
              Delete
            </button>
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-warm-white/40 text-sm">No admin users found.</p>
        )}
      </div>
    </div>
  );
}
