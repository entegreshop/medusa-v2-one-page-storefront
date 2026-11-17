import { redirect } from "next/navigation"

export default async function CatchAllMainRedirect(props: {
  params: Promise<{ countryCode: string; rest?: string[] }>
}) {
  const params = await props.params
  const cc = params?.countryCode || "tr"
  redirect(`/${cc}`)
}
