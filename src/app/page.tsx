"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function login(e: any) {
    e.preventDefault()

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      setError("invalid credentials")
      return
    }

    // el cookie ya quedó guardado
    router.push("/admin")
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <form onSubmit={login}>
        <input
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <br /><br />

        <button>Login</button>
      </form>

      {error && <p>{error}</p>}
    </div>
  )
}