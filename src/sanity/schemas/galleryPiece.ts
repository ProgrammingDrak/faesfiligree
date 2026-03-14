import { defineField, defineType } from "sanity";

export const galleryPiece = defineType({
  name: "galleryPiece",
  title: "Gallery Piece",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
            },
          ],
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "materials",
      title: "Materials",
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
      name: "year",
      title: "Year Created",
      type: "number",
    }),
    defineField({
      name: "isSold",
      title: "Sold",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isCommission",
      title: "Commission Piece",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "images.0",
      sold: "isSold",
    },
    prepare({ title, media, sold }) {
      return {
        title,
        media,
        subtitle: sold ? "Sold" : "Available",
      };
    },
  },
});
