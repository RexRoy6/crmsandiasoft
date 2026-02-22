import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { comparePassword } from "@/lib/auth/password"
import { signToken } from "@/lib/auth/jwt"

export async function POST(req:Request){

  const { email,password } = await req.json()

  const user = await db.query.users.findFirst({
    where:eq(users.email,email)
  })

  if(!user){
    return NextResponse.json({error:"invalid credentials"},{status:401})
  }

  const valid = await comparePassword(
    password,
    user.passwordHash
  )

  if(!valid){
    return NextResponse.json({error:"invalid credentials"},{status:401})
  }

const token = await signToken({
  userId: user.id,
  companyId: user.companyId,
  role: user.role
})

  return NextResponse.json({token})
}