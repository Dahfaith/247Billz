import React from 'react'

export default function HowItWorksPage() {
  return (
    <div className="prose max-w-4xl mx-auto p-8">
      <h1>How 247Billz Works</h1>

      <p>
        This page explains how invoices and payments work, what clients see, and what business
        owners must do before creating and sharing invoices.
      </p>

      <h2>Overview</h2>
      <ul>
        <li>Businesses create invoices in the dashboard and share a public invoice link with clients.</li>
        <li>Clients open the link, review the invoice, and tap the Pay button to pay online.</li>
        <li>Payments are processed by the configured payment gateway (Flutterwave).</li>
      </ul>

      <h2>Checklist — What Business Owners Must Do Before Creating/Sharing Invoices</h2>
      <ol>
        <li>
          Complete your Business Profile: add your business name, email, and address so invoices
          show correct details.
        </li>
        <li>
          Configure Payout Bank Account (required to accept online payments):
          <ul>
            <li>Select your bank from the dropdown (the app submits the numeric bank code).</li>
            <li>Enter a valid 10-digit account number and verify it using the Verify button.</li>
            <li>If verification fails, double-check bank code and account number, then retry.</li>
          </ul>
        </li>
        <li>
          Configure Payment Gateway Keys: ensure `FLW_SECRET_KEY` (server-side) is set in
          your environment. Without a valid server secret, payment initialization will fail.
        </li>
        <li>
          Test with a sample invoice (send to yourself) before sharing with customers.
        </li>
      </ol>

      <h2>What Clients See and What to Tell Them</h2>
      <ul>
        <li>
          Clients open the invoice link and see a Pay button if the business accepts online payment.
        </li>
        <li>
          If the business has not configured a payout bank account, the client will see a clear
          notice: <strong>“This business has not configured their payout bank account yet. Payment cannot be processed.”</strong>
        </li>
        <li>
          If payment fails, the client will see a friendly message such as:
          <div className="alert alert-info mt-2">
            "We couldn't complete your payment right now. Please try again later or contact the business."
          </div>
        </li>
      </ul>

      <h2>Recommended User-Facing Messages</h2>
      <h3>For Clients (friendly)</h3>
      <ul>
        <li>
          Payment not available: "This business has not configured their payout bank account yet. Payment cannot be processed."
        </li>
        <li>
          Verification failed: "We couldn't verify your payment details. Please confirm your card or try another method."
        </li>
        <li>
          Generic payment error: "We couldn't complete your payment right now. Please try again later or contact the business."
        </li>
      </ul>

      <h3>For Business Owners (admin / dashboard)</h3>
      <ul>
        <li>
          Bank verify failure: "Bank verification failed — check the bank and 10-digit account number, then try again."
        </li>
        <li>
          Missing payout account: "You must verify and save a payout bank account before you can receive online payments."
        </li>
        <li>
          Payment gateway error: "Payment gateway returned an error. Check gateway keys in settings and try again."
        </li>
      </ul>

      <h2>Troubleshooting & Common Errors</h2>
      <ul>
        <li>
          "invalid account" — Usually the account number does not match the bank. Re-check the 10-digit
          number and verify it in your dashboard.
        </li>
        <li>
          "destbankcode/account_bank must be numeric" — Ensure the bank selector sends the numeric bank
          code (e.g., 044) to the server, not a label string.
        </li>
        <li>
          If you see provider messages in logs (e.g. from Flutterwave), map them to friendly messages in the UI
          and keep the provider details in server logs only.
        </li>
      </ul>

      <h2>Developer Notes (implementation suggestions)</h2>
      <ol>
        <li>Validate on the client: bank code is numeric, account number is 10 digits.</li>
        <li>Validate on the server before calling provider and map provider errors to friendly messages.</li>
        <li>Log full provider responses for debugging; do not show raw messages to users.</li>
      </ol>

      <h2>Need more help?</h2>
      <p>
        Contact support at the business owner email or use the in-dashboard support ticket form. We recommend
        adding a link to this page from the dashboard and from invoice emails so users and owners can find it easily.
      </p>
    </div>
  )
}
