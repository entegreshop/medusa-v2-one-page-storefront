export const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl
  }
  if (process.env.NODE_ENV === "development" && envUrl) {
    return envUrl
  }
  return "https://cizgibutik.com"
}
