"use client";

import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";
import Link from "next/link";

export function Navigation() {
  const { canAccessAdmin, canManageUsers, userRole, isLoaded } = useUserRole();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Test Clerk App
            </Link>

            <SignedIn>
              <div className="hidden sm:flex sm:space-x-8">
                <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>

                <Link href="/profile" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Perfil
                </Link>

                <Link href="/api-test" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Teste API
                </Link>

                <Link href="/table-example" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Tabela Completa
                </Link>

                <Link href="/simple-table" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Tabela Simples
                </Link>

                {canManageUsers() && (
                  <Link href="/users" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Usuários
                  </Link>
                )}

                {canAccessAdmin() && (
                  <Link href="/admin" className="text-blue-600 hover:text-blue-800 px-3 py-2 text-sm font-medium">
                    Admin
                  </Link>
                )}
              </div>
            </SignedIn>
          </div>

          <div className="flex items-center space-x-4">
            <SignedIn>
              {isLoaded && userRole && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{userRole}</span>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
                afterSignOutUrl="/"
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Entrar
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <SignedIn>
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">
              Dashboard
            </Link>

            <Link href="/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">
              Perfil
            </Link>

            <Link href="/api-test" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">
              Teste API
            </Link>

            <Link
              href="/table-example"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
            >
              Tabela Completa
            </Link>

            <Link
              href="/simple-table"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
            >
              Tabela Simples
            </Link>

            {canManageUsers() && (
              <Link href="/users" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900">
                Usuários
              </Link>
            )}

            {canAccessAdmin() && (
              <Link href="/admin" className="block px-3 py-2 text-base font-medium text-blue-600 hover:text-blue-800">
                Admin
              </Link>
            )}
          </div>
        </div>
      </SignedIn>
    </nav>
  );
}
