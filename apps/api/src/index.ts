import { serve } from "@hono/node-server"
import { Hono } from "hono"
import emailRoutes from "./routes/email"
import { initDb } from "./db"

const app = new Hono()

// Initialize database
initDb()

// CORS middleware - simple implementation
app.use("/*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*")
  c.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  c.header("Access-Control-Allow-Headers", "Content-Type")
  
  if (c.req.method === "OPTIONS") {
    return c.text("", 204)
  }
  
  await next()
})

// Routes
app.route("/api/emails", emailRoutes)

// Health check
app.get("/health", (c) => c.json({ status: "ok" }))

const port = process.env.PORT || 3001

console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port: Number(port),
})