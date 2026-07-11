import Medusa from "@medusajs/js-sdk"

const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.cizgibutik.com"

export const medusa = new Medusa({
  baseUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_7587df1c043fb92eebc89c01e37c6e50ef92da4fdc68ab9a49a731594c3d7b0e",
})
