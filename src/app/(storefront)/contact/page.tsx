"use client";

import { useState } from "react";
import { Button, Input, Textarea, ScrollReveal } from "@/components/ui";
import { SOCIAL_LINKS } from "@/lib/constants";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // In production, this would be a Server Action sending an email
    // or creating a document in Sanity
    await new Promise((r) => setTimeout(r, 1000));

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <ScrollReveal>
        <h1 className="font-heading text-4xl sm:text-5xl text-center text-charcoal mb-3">
          Get in Touch
        </h1>
        <p className="text-center text-charcoal/60 mb-12 max-w-lg mx-auto">
          Have a question, want to collaborate, or just want to say hello?
          I&apos;d love to hear from you.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <ScrollReveal>
          {submitted ? (
            <div className="text-center py-12">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto text-copper mb-4"
              >
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
              <h3 className="font-heading text-2xl text-charcoal mb-2">
                Message Sent!
              </h3>
              <p className="text-charcoal/60">
                Thank you for reaching out. I&apos;ll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Name"
                id="contact-name"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                placeholder="Your name"
              />
              <Input
                label="Email"
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                placeholder="your@email.com"
              />
              <Textarea
                label="Message"
                id="contact-message"
                value={form.message}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, message: e.target.value }))
                }
                required
                placeholder="What's on your mind?"
                rows={5}
              />
              <Button type="submit" loading={submitting} className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </ScrollReveal>

        {/* Contact Info */}
        <ScrollReveal delay={0.2}>
          <div className="space-y-8">
            <div>
              <h3 className="font-heading text-xl text-charcoal mb-2">Email</h3>
              <a
                href="mailto:hello@faesfiligree.com"
                className="text-copper hover:text-copper-dark transition-colors"
              >
                hello@faesfiligree.com
              </a>
            </div>

            <div>
              <h3 className="font-heading text-xl text-charcoal mb-2">
                Follow Along
              </h3>
              <div className="space-y-2">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-copper hover:text-copper-dark transition-colors"
                  >
                    {link.label} &rarr;
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-heading text-xl text-charcoal mb-2">
                Custom Work
              </h3>
              <p className="text-charcoal/60 text-sm">
                Looking for a bespoke piece? Head over to the{" "}
                <a
                  href="/commissions"
                  className="text-copper hover:text-copper-dark transition-colors"
                >
                  commissions page
                </a>{" "}
                to start a request.
              </p>
            </div>

            <div className="bg-parchment-dark/50 rounded-xl p-6">
              <h3 className="font-heading text-lg text-charcoal mb-2">
                Response Time
              </h3>
              <p className="text-charcoal/60 text-sm">
                I typically respond within 1-2 business days. For commission
                inquiries, please allow 2-3 business days for a detailed reply.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
