async function getCompanies(token: string) {
  const res = await fetch("http://localhost:3000/api/admin/companies", {
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  })

  return res.json()
}

export default async function AdminDashboard() {
  const companies = await getCompanies("TOKEN_AQUI")

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <h2>Companies</h2>

      <pre>{JSON.stringify(companies, null, 2)}</pre>
    </div>
  )
}