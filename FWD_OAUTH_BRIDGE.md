# FWD OAuth Bridge

Trey TV acts as the identity authority for FWD's **Continue with Trey TV** button. FWD stays a separate product at `https://fwd.treytv.com`; Trey TV only verifies the user and returns a short-lived authorization code.

## Client

- `client_id`: `7a8b2b60-9597-45cb-99fd-66abd03abcb2`
- App name: `FWD`
- Allowed redirects:
  - `https://fwd.treytv.com/auth/trey-tv/callback`
  - `http://localhost:5173/auth/trey-tv/callback`
- Allowed scopes: `profile`

The client secret is server-only. Generate it outside Git, hash it for `fwd_oauth_clients.client_secret_hash`, and store the raw secret only in server environment variables.

## Server Env

```bash
FWD_OAUTH_CLIENT_ID=7a8b2b60-9597-45cb-99fd-66abd03abcb2
FWD_OAUTH_CLIENT_SECRET=
FWD_ALLOWED_REDIRECT_URI=https://fwd.treytv.com/auth/trey-tv/callback
FWD_LOCAL_REDIRECT_URI=http://localhost:5173/auth/trey-tv/callback
FWD_OAUTH_SECRET_PEPPER=
TREY_TV_PUBLIC_ORIGIN=https://tv.treytrizzy.com
```

Do not prefix these with `VITE_` or `NEXT_PUBLIC_`.

## Tables

- `fwd_oauth_clients`: server-side FWD OAuth client config and secret hash.
- `fwd_oauth_codes`: 5-minute one-time authorization codes tied to `client_id`, `redirect_uri`, and the Trey TV user.
- `fwd_oauth_tokens`: optional hashed token ledger. Runtime currently uses signed short-lived bearer tokens.

## Authorize

FWD sends the user to:

```text
GET /api/fwd/oauth/authorize?client_id=7a8b2b60-9597-45cb-99fd-66abd03abcb2&redirect_uri=https%3A%2F%2Ffwd.treytv.com%2Fauth%2Ftrey-tv%2Fcallback&response_type=code&scope=profile&state=GENERATED_STATE
```

Trey TV validates:

- exact `client_id`
- allowlisted `redirect_uri`
- `response_type=code`
- allowed `scope=profile`

If the user is signed out, Trey TV sends them to existing Trey TV login and resumes this route afterward. If signed in, the consent screen asks: **Allow FWD to use your Trey TV account?**

On continue, Trey TV ensures the user has a public 16-digit UID starting with `423`, stores a one-time code, and redirects:

```text
https://fwd.treytv.com/auth/trey-tv/callback?code=AUTH_CODE&state=GENERATED_STATE
```

## Token

FWD backend exchanges the code:

```http
POST /api/fwd/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE",
  "redirect_uri": "https://fwd.treytv.com/auth/trey-tv/callback",
  "client_id": "7a8b2b60-9597-45cb-99fd-66abd03abcb2",
  "client_secret": "server-only-secret"
}
```

Success:

```json
{
  "access_token": "short-lived-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "trey_tv_uid": "4230000000000000",
    "display_name": "Display Name",
    "avatar_url": "https://...",
    "profile_url": "https://tv.treytrizzy.com/u/4230000000000000"
  }
}
```

## Userinfo

```http
GET /api/fwd/oauth/userinfo
Authorization: Bearer TOKEN
```

Success:

```json
{
  "sub": "4230000000000000",
  "provider": "trey_tv",
  "trey_tv_uid": "4230000000000000",
  "name": "Display Name",
  "picture": "https://...",
  "profile_url": "https://tv.treytrizzy.com/u/4230000000000000"
}
```

Invalid or expired tokens return `401`.

## Shared Data

Shared with FWD:

- public Trey TV UID
- display name
- avatar URL
- profile URL

Never shared:

- Supabase service role keys
- raw Trey TV sessions
- raw Supabase auth tokens
- internal user UUIDs as public identity
- private emails
- admin flags or roles
- DOB, private location, or private profile fields
- database passwords

## Testing

1. Seed `fwd_oauth_clients` with the FWD client id, hashed secret, allowed redirects, and `profile` scope.
2. Visit the authorize URL while signed out and confirm Trey TV login appears first.
3. Complete login and confirm the FWD consent screen resumes.
4. Continue and confirm FWD receives `code` and the original `state`.
5. Exchange the code once and confirm safe profile JSON.
6. Reuse the same code and confirm `invalid_grant`.
7. Try an unlisted `redirect_uri` and confirm it is blocked.
8. Call `/api/fwd/oauth/userinfo` with a valid token, then with an invalid token.
