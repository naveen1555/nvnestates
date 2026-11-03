import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

export function ClerkAuthControls() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button type="button" className="auth-chip">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button type="button" className="auth-chip auth-chip--solid">
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton afterSignOutUrl="/" />
      </Show>
    </>
  )
}
