"use client";

import { useState } from "react";
import { createEvent } from "@/lib/actions/events";

export default function NewEventPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await createEvent(formData);
    if (result?.error) setError(result.error);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl text-warm-white mb-6">Create Event</h1>

      {error && (
        <div className="bg-rose-gold/20 border border-rose-gold/30 rounded-lg p-3 text-rose-gold text-sm mb-4">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Event Name</label>
          <input
            name="name"
            required
            placeholder="e.g., Spring Renaissance Faire"
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">Start Date</label>
            <input
              name="startDate"
              type="date"
              required
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
          <div>
            <label className="block text-sm text-warm-white/70 mb-1">End Date (optional)</label>
            <input
              name="endDate"
              type="date"
              className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Location</label>
          <input
            name="location"
            placeholder="City, State or venue name"
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Notes</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-copper hover:bg-copper-dark text-white rounded-lg font-medium transition-colors"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
