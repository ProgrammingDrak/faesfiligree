import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { sanityConfig } from "./env";

// Custom desk structure for singleton documents
const deskStructure = (S: ReturnType<typeof structureTool>extends { config: { structure: infer T } } ? never : any) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings")
        ),
      S.divider(),
      S.documentTypeListItem("product").title("Products"),
      S.documentTypeListItem("galleryPiece").title("Gallery"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("commission").title("Commissions"),
    ]);

export default defineConfig({
  name: "faesfiligree",
  title: "Fae's Filigree",
  projectId: sanityConfig.projectId,
  dataset: sanityConfig.dataset,
  plugins: [
    structureTool({
      structure: deskStructure as any,
    }),
    visionTool({ defaultApiVersion: sanityConfig.apiVersion }),
  ],
  schema: {
    types: schemaTypes,
  },
});
