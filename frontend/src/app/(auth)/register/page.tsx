import { Metadata } from "next"
import Link from "next/link"

import { AuthForm } from "../components/auth-form"

export const metadata: Metadata = {
  title: "注册",
  description: "创建新账户",
}

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          创建账户
        </h1>
        <p className="text-sm text-muted-foreground">
          输入您的信息创建新账户
        </p>
      </div>
      <AuthForm mode="register" />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="hover:text-brand underline underline-offset-4"
        >
          已有账户？点击登录
        </Link>
      </p>
    </>
  )
} 