import { defineField, defineType } from "sanity";

export const commission = defineType({
  name: "commission",
  title: "Commission Request",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Client Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "pieceType",
      title: "Piece Type",
      type: "string",
      options: {
        list: [
          "Ring",
          "Necklace",
          "Earrings",
          "Bracelet",
          "Brooch",
          "Hair Piece",
          "Other",
        ],
      },
    }),
    defineField({
      name: "stylePreferences",
      title: "Style Preferences",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          "Delicate / Minimalist",
          "Bold / Statement",
          "Nature-inspired",
          "Geometric",
          "Vintage / Antique",
          "Whimsical / Fantasy",
          "Bohemian",
          "Elegant / Classic",
        ],
      },
    }),
    defineField({
      name: "materials",
      title: "Preferred Materials",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          "Copper",
          "Sterling Silver",
          "Gold-filled",
          "Brass",
          "Bronze",
          "Gemstone",
          "Crystal",
          "Pearl",
          "Glass",
          "Wood",
        ],
      },
    }),
    defineField({
      name: "budgetRange",
      title: "Budget Range",
      type: "string",
      options: {
        list: [
          { title: "Under $50", value: "under-50" },
          { title: "$50 – $100", value: "50-100" },
          { title: "$100 – $250", value: "100-250" },
          { title: "$250 – $500", value: "250-500" },
          { title: "$500+", value: "500-plus" },
        ],
      },
    }),
    defineField({
      name: "timeline",
      title: "Timeline",
      type: "string",
      options: {
        list: [
          { title: "Flexible / No rush", value: "flexible" },
          { title: "1–2 weeks", value: "1-2-weeks" },
          { title: "3–4 weeks", value: "3-4-weeks" },
          { title: "1–2 months", value: "1-2-months" },
          { title: "I have a specific date", value: "specific-date" },
        ],
      },
    }),
    defineField({
      name: "targetDate",
      title: "Target Date",
      type: "date",
      hidden: ({ parent }) => parent?.timeline !== "specific-date",
    }),
    defineField({
      name: "description",
      title: "Description / Vision",
      type: "text",
      rows: 6,
    }),
    defineField({
      name: "referenceImages",
      title: "Reference Images",
      type: "array",
      of: [{ type: "image" }],
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: "inspirationPieces",
      title: "Inspiration from Gallery",
      type: "array",
      of: [{ type: "reference", to: [{ type: "galleryPiece" }] }],
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Reviewing", value: "reviewing" },
          { title: "Quoted", value: "quoted" },
          { title: "Accepted", value: "accepted" },
          { title: "In Progress", value: "in-progress" },
          { title: "Completed", value: "completed" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "notes",
      title: "Private Notes",
      type: "text",
      rows: 4,
      description: "Internal notes — not visible to clients",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "pieceType",
      status: "status",
    },
    prepare({ title, subtitle, status }) {
      return {
        title: title || "Unknown client",
        subtitle: `${subtitle || "Unknown type"} — ${status || "new"}`,
      };
    },
  },
});
