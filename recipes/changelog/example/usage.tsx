// Example footer link for the changelog
// Add this to your Footer component alongside Terms and Privacy links

import Link from "next/link"

export function FooterChangelogLink() {
  return (
    <Link href="/changes" className="hover:underline">
      Changes
    </Link>
  )
}
