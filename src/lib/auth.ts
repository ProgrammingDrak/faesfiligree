/**
 * Admin access is gated by Clerk email-code sign-in, restricted to the
 * email address(es) in ADMIN_ALLOWED_EMAILS (comma-separated). The
 * implementation lives in the shared drake-auth kit (drake-auth/next) —
 * this module just re-exports it under the app's historical names.
 */
export {
  getAllowedEmails as getAllowedAdminEmails,
  isAllowedEmail as isAllowedAdminEmail,
  getAdminEmail,
} from "drake-auth/next";
