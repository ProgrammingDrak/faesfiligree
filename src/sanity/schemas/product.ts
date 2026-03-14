import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "price",
      title: "Price (in cents)",
      type: "number",
      validation: (rule) => rule.required().min(0),
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
      name: "dimensions",
      title: "Dimensions",
      type: "string",
    }),
    defineField({
      name: "inStock",
      title: "In Stock",
      type: "boolean",
      initialValue: true,
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
      title: "name",
      media: "images.0",
      subtitle: "price",
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: subtitle ? `$${(subtitle / 100).toFixed(2)}` : "No price",
      };
    },
  },
});
