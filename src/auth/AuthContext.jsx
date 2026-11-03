import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ClerkProvider, useClerk, useUser } from '@clerk/react'
import { normalizeRole, ROLES } from './roles'

const AuthContext = createContext(null)
const DEMO_STORAGE_KEY = 'nvnestate-demo-auth'
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function readDemoAuth() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function DemoAuthInner({ children }) {
  const [session, setSession] = useState(readDemoAuth)

  const signInAs = useCallback((role) => {
    const next = {
      userId: `demo-${role}`,
      fullName:
        role === ROLES.ADMIN
          ? 'Demo Admin'
          : role === ROLES.AGENT
            ? 'Demo Agent'
            : 'Demo Buyer',
      role,
    }
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const setRole = useCallback((role) => {
    setSession((current) => {
      if (!current) return current
      const next = { ...current, role }
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      mode: 'demo',
      isLoaded: true,
      isSignedIn: Boolean(session),
      userId: session?.userId ?? null,
      fullName: session?.fullName ?? null,
      role: session?.role ?? null,
      needsRole: Boolean(session && !session.role),
      setRole,
      signInAs,
      signOut,
    }),
    [session, setRole, signInAs, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function ClerkAuthInner({ children }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const role = normalizeRole(user?.unsafeMetadata?.role)

  const setRole = useCallback(
    async (nextRole) => {
      if (!user) return
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          role: nextRole,
        },
      })
    },
    [user],
  )

  const value = useMemo(
    () => ({
      mode: 'clerk',
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      userId: user?.id ?? null,
      fullName: user?.fullName || user?.primaryEmailAddress?.emailAddress || null,
      role,
      needsRole: Boolean(isSignedIn && user && !role),
      setRole,
      signInAs: null,
      signOut: () => signOut({ redirectUrl: '/' }),
    }),
    [isLoaded, isSignedIn, role, setRole, signOut, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AppAuthProvider({ children }) {
  if (!clerkKey) {
    return <DemoAuthInner>{children}</DemoAuthInner>
  }

  return (
    <ClerkProvider publishableKey={clerkKey} afterSignOutUrl="/">
      <ClerkAuthInner>{children}</ClerkAuthInner>
    </ClerkProvider>
  )
}

export function useAppAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAppAuth must be used within AppAuthProvider')
  }
  return value
}

export function isClerkConfigured() {
  return Boolean(clerkKey)
}
