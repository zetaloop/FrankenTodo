import { Metadata } from "next"
import Link from "next/link"

import { AuthForm } from "../components/auth-form"

export const metadata: Metadata = {
  title: "登录",
  description: "登录到您的账户",
}

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          登录账户
        </h1>
        <p className="text-sm text-muted-foreground">
          输入您的邮箱和密码登录
        </p>
      </div>
      <AuthForm mode="login" />
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/register"
          className="hover:text-brand underline underline-offset-4"
        >
          没有账户？点击注册
        </Link>
      </p>
    </>
  )
} 