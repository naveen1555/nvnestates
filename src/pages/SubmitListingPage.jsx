import { Link } from 'react-router-dom'
import { useAppAuth } from '../auth/AuthContext'
import { canManageListings, ROLES } from '../auth/roles'
import { ListingSubmitForm } from '../components/ListingSubmitForm'

export function SubmitListingPage({ onSubmitListing }) {
  const auth = useAppAuth()

  if (!auth.isSignedIn) {
    return (
      <main className="page page--narrow">
        <p className="eyebrow">Agent tools</p>
        <h1>Submit a listing</h1>
        <p className="page-copy">
          Sign in as an Agent / Seller to post and edit property listings.
        </p>
        {auth.mode === 'demo' ? (
          <button
            type="button"
            className="listing-form__primary"
            onClick={() => auth.signInAs(ROLES.AGENT)}
          >
            Continue as demo agent
          </button>
        ) : (
          <Link className="listing-form__primary" to="/">
            Sign in from the header
          </Link>
        )}
      </main>
    )
  }

  if (!canManageListings(auth.role)) {
    return (
      <main className="page page--narrow">
        <p className="eyebrow">Agent tools</p>
        <h1>Agent access required</h1>
        <p className="page-copy">
          Buyer accounts can save homes and alerts. Switch to an Agent / Seller role to post
          listings.
        </p>
        <Link className="listing-form__primary" to="/">
          Back to listings
        </Link>
      </main>
    )
  }

  return (
    <main className="page">
      <ListingSubmitForm onSubmitListing={onSubmitListing} />
    </main>
  )
}
