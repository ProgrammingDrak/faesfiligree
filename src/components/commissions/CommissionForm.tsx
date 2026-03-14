"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button, Input, Select, Textarea, FileUpload } from "@/components/ui";
import { BUDGET_RANGES, TIMELINES, MATERIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Zod schemas per step
const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const step2Schema = z.object({
  pieceType: z.string().min(1, "Please select a piece type"),
  stylePreferences: z.array(z.string()).min(1, "Please select at least one style"),
  materials: z.array(z.string()).optional(),
});

const step3Schema = z.object({
  budgetRange: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  targetDate: z.string().optional(),
});

const step4Schema = z.object({
  description: z.string().min(10, "Please describe your vision (at least 10 characters)"),
});

const PIECE_TYPES = [
  { value: "ring", label: "Ring" },
  { value: "necklace", label: "Necklace" },
  { value: "earrings", label: "Earrings" },
  { value: "bracelet", label: "Bracelet" },
  { value: "brooch", label: "Brooch" },
  { value: "hair-piece", label: "Hair Piece" },
  { value: "other", label: "Other" },
];

const STYLE_OPTIONS = [
  "Delicate / Minimalist",
  "Bold / Statement",
  "Nature-inspired",
  "Geometric",
  "Vintage / Antique",
  "Whimsical / Fantasy",
  "Bohemian",
  "Elegant / Classic",
];

const STEPS = ["Contact", "Piece Details", "Budget & Timeline", "Your Vision"];

interface FormData {
  name: string;
  email: string;
  pieceType: string;
  stylePreferences: string[];
  materials: string[];
  budgetRange: string;
  timeline: string;
  targetDate: string;
  description: string;
  referenceImages: File[];
}

export function CommissionForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    pieceType: "",
    stylePreferences: [],
    materials: [],
    budgetRange: "",
    timeline: "",
    targetDate: "",
    description: "",
    referenceImages: [],
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const toggleArrayItem = (key: "stylePreferences" | "materials", item: string) => {
    setFormData((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(item)
          ? arr.filter((i) => i !== item)
          : [...arr, item],
      };
    });
  };

  const validateStep = () => {
    const schemas = [step1Schema, step2Schema, step3Schema, step4Schema];
    const result = schemas[step].safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setSubmitting(true);
    try {
      // In production, this would submit to a Server Action that creates
      // a Commission document in Sanity and sends a notification email
      await new Promise((r) => setTimeout(r, 1500)); // Simulated delay
      router.push("/commissions/success");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  i <= step
                    ? "bg-copper text-white"
                    : "bg-charcoal/10 text-charcoal/40"
                )}
              >
                {i + 1}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 hidden sm:block",
                  i <= step ? "text-copper" : "text-charcoal/40"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "w-12 sm:w-20 h-0.5 mx-2",
                  i < step ? "bg-copper" : "bg-charcoal/10"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Contact */}
      {step === 0 && (
        <div className="space-y-6">
          <Input
            label="Your Name"
            id="name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            error={errors.name}
            placeholder="e.g., Luna Silverwood"
          />
          <Input
            label="Email Address"
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            error={errors.email}
            placeholder="luna@example.com"
          />
        </div>
      )}

      {/* Step 2: Piece Details */}
      {step === 1 && (
        <div className="space-y-6">
          <Select
            label="Type of Piece"
            id="pieceType"
            value={formData.pieceType}
            onChange={(e) => updateField("pieceType", e.target.value)}
            options={PIECE_TYPES}
            placeholder="Select a piece type..."
            error={errors.pieceType}
          />

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Style Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => toggleArrayItem("stylePreferences", style)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm transition-all",
                    formData.stylePreferences.includes(style)
                      ? "bg-copper text-white"
                      : "bg-copper/10 text-charcoal hover:bg-copper/20"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
            {errors.stylePreferences && (
              <p className="text-sm text-red-500 mt-1">
                {errors.stylePreferences}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Preferred Materials
            </label>
            <div className="flex flex-wrap gap-2">
              {MATERIALS.map((material) => (
                <button
                  key={material}
                  type="button"
                  onClick={() => toggleArrayItem("materials", material)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm transition-all",
                    formData.materials.includes(material)
                      ? "bg-copper text-white"
                      : "bg-copper/10 text-charcoal hover:bg-copper/20"
                  )}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Budget & Timeline */}
      {step === 2 && (
        <div className="space-y-6">
          <Select
            label="Budget Range"
            id="budgetRange"
            value={formData.budgetRange}
            onChange={(e) => updateField("budgetRange", e.target.value)}
            options={BUDGET_RANGES.map((b) => ({
              value: b.value,
              label: b.label,
            }))}
            placeholder="Select your budget..."
            error={errors.budgetRange}
          />

          <Select
            label="Timeline"
            id="timeline"
            value={formData.timeline}
            onChange={(e) => updateField("timeline", e.target.value)}
            options={TIMELINES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
            placeholder="Select a timeline..."
            error={errors.timeline}
          />

          {formData.timeline === "specific-date" && (
            <Input
              label="Target Date"
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => updateField("targetDate", e.target.value)}
            />
          )}
        </div>
      )}

      {/* Step 4: Vision */}
      {step === 3 && (
        <div className="space-y-6">
          <Textarea
            label="Describe Your Vision"
            id="description"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            error={errors.description}
            placeholder="Tell me about the piece you envision — colors, themes, occasions, feelings, anything that inspires you..."
            rows={6}
          />

          <FileUpload
            label="Reference Images (optional)"
            onChange={(files) => updateField("referenceImages", files)}
            value={formData.referenceImages}
            maxFiles={5}
            maxSizeMB={10}
          />
        </div>
      )}

      {/* Error */}
      {errors.submit && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.submit}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-10">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 0}
        >
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={handleNext}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} loading={submitting}>
            Submit Request
          </Button>
        )}
      </div>
    </div>
  );
}
