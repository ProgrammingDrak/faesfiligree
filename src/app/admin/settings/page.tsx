"use client";

import { useState, useEffect } from "react";
import { updateSiteSettings } from "@/lib/actions/settings";

interface SiteSettings {
  heroHeading: string;
  heroSubheading: string;
  aboutContent: string | null;
  contactEmail: string | null;
  laborRate: number;
  processSteps: { title: string; description: string; icon: string }[] | null;
  socialLinks: { platform: string; url: string }[] | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleSubmit = async (formData: FormData) => {
    formData.set("processSteps", JSON.stringify(settings?.processSteps || []));
    formData.set("socialLinks", JSON.stringify(settings?.socialLinks || []));
    await updateSiteSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) {
    return (
      <div>
        <h1 className="font-heading text-3xl text-warm-white mb-4">Settings</h1>
        <p className="text-warm-white/50">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-3xl text-warm-white mb-6">Site Settings</h1>

      {saved && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm mb-4">
          Settings saved!
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Hero Heading</label>
          <input
            name="heroHeading"
            defaultValue={settings.heroHeading}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Hero Subheading</label>
          <input
            name="heroSubheading"
            defaultValue={settings.heroSubheading}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Contact Email</label>
          <input
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail || ""}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">Labor Rate ($/hour)</label>
          <input
            name="laborRate"
            type="number"
            step="0.01"
            defaultValue={(settings.laborRate / 100).toFixed(2)}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
          <p className="text-warm-white/40 text-xs mt-1">Used in analytics to calculate labor costs.</p>
        </div>

        <div>
          <label className="block text-sm text-warm-white/70 mb-1">About Content</label>
          <textarea
            name="aboutContent"
            rows={4}
            defaultValue={settings.aboutContent || ""}
            className="w-full px-3 py-2 bg-warm-white/10 border border-warm-white/20 rounded-lg text-warm-white focus:outline-none focus:ring-2 focus:ring-copper"
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-copper hover:bg-copper-dark text-white rounded-lg font-medium transition-colors"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
