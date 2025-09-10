import MailOneUltimate from "@/components/MailOneUltimate"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function Home() {
  return (
    <ProtectedRoute>
      <main className="flex h-screen">
        <MailOneUltimate />
      </main>
    </ProtectedRoute>
  )
}