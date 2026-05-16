# FWD Trey TV Login Bridge

FWD can offer a **Continue with Trey TV** button without merging into Trey TV. Trey TV remains the account authority, and FWD exchanges a one-time authorization code from its backend.

## Endpoints

- `GET /api/fwd/oauth/authorize`
  Starts the browser authorization flow from FWD.
- `POST /api/fwd/oauth/token`
  Lets the FWD backend exchange an authorization code for a short-lived signed bearer token and safe Trey TV profile fields.
- `GET|POST /api/fwd/oauth/userinfo`
  Lets the FWD backend fetch safe profile fields using the short-lived bearer token.

## Required Environment Variables

Trey TV and FWD should agree on these values server-side:

```bash
FWD_OAUTH_CLIENT_ID=7a8b2b60-9597-45cb-99fd-66abd03abcb2
FWD_OAUTH_CLIENT_SECRET=
FWD_ALLOWED_REDIRECT_URI=https://fwd.treytv.com/auth/trey-tv/callback
FWD_LOCAL_REDIRECT_URI=http://localhost:5173/auth/trey-tv/callback
FWD_OAUTH_SECRET_PEPPER=
```

Do not expose `FWD_OAUTH_CLIENT_SECRET` to FWD frontend code. The Trey TV token signature also depends on Trey TV server secrets and the stored client secret hash.

## Register FWD

Create one FWD OAuth client in Trey TV's database. Generate the client secret outside SQL, store it securely in FWD backend env, then store only its SHA-256 hash in Trey TV.

Example SQL only:

```sql
insert into public.fwd_oauth_clients (
  client_id,
  client_secret_hash,
  app_name,
  allowed_redirect_uris
) values (
  '7a8b2b60-9597-45cb-99fd-66abd03abcb2',
  'sha256:<sha256-of-real-secret>',
  'FWD',
  array[
    'https://fwd.treytv.com/auth/trey-tv/callback',
    'http://localhost:5173/auth/trey-tv/callback'
  ]
);
```

Do not commit or paste the production secret into migrations, docs, or frontend code.

## How FWD Starts Login

FWD sends the user to Trey TV:

```text
https://tv.treytrizzy.com/api/fwd/oauth/authorize?client_id=7a8b2b60-9597-45cb-99fd-66abd03abcb2&redirect_uri=https%3A%2F%2Ffwd.treytv.com%2Fauth%2Ftrey-tv%2Fcallback&response_type=code&scope=profile&state=<opaque-random-state>
```

Trey TV validates `client_id` and `redirect_uri`. If the user is signed out, Trey TV sends them through the existing Trey TV login and returns them to this authorization request. If signed in, Trey TV shows a lightweight consent screen.

On approval, Trey TV redirects to:

```text
https://fwd.treytv.com/auth/trey-tv/callback?code=<AUTH_CODE>&state=<same-state>
```

FWD must validate the returned `state` against the value it created before exchanging the code.

## Authorization Codes

Authorization codes are stored in `fwd_oauth_codes` with the internal Trey TV user id for server-side lookup only, public UID, display name, avatar, profile URL, original `redirect_uri`, `client_id`, scope, expiration, and `used_at`.

Codes expire after about 5 minutes and are one-time use. The token endpoint marks a code used with a conditional update so a reused code is rejected.

## Token Exchange

FWD backend posts to Trey TV:

```http
POST /api/fwd/oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "code": "<AUTH_CODE>",
  "redirect_uri": "https://fwd.treytv.com/auth/trey-tv/callback",
  "client_id": "7a8b2b60-9597-45cb-99fd-66abd03abcb2",
  "client_secret": "<server-side-secret>"
}
```

Response:

```json
{
  "access_token": "short-lived-signed-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "trey_tv_uid": "423...",
    "display_name": "Display Name",
    "avatar_url": "https://...",
    "profile_url": "https://tv.treytrizzy.com/u/423..."
  }
}
```

The response does not include Supabase service-role keys, raw Trey TV session tokens, client secrets, private profile data, or internal Trey TV IDs as public identity.

## Userinfo

FWD backend can call:

```http
GET /api/fwd/oauth/userinfo
Authorization: Bearer <access_token>
```

Response:

```json
{
  "sub": "423...",
  "trey_tv_uid": "423...",
  "name": "Display Name",
  "picture": "https://...",
  "profile_url": "https://tv.treytrizzy.com/u/423..."
}
```

## Local Testing

1. Apply the migration that creates `fwd_oauth_clients` and `fwd_oauth_codes`.
2. Insert a local FWD client with `http://localhost:5173/auth/trey-tv/callback`.
3. Run Trey TV locally.
4. From FWD local dev, redirect to Trey TV `/api/fwd/oauth/authorize` with `response_type=code`.
5. Confirm that signed-out users are sent to Trey TV login first.
6. Approve consent and confirm FWD receives `code` and unchanged `state`.
7. Exchange the code from the FWD backend and call `/api/fwd/oauth/userinfo`.

## Production Testing

1. Register the production FWD client with `https://fwd.treytv.com/auth/trey-tv/callback`.
2. Use a server-only production `FWD_OAUTH_CLIENT_SECRET`.
3. Test from `https://fwd.treytv.com`.
4. Confirm invalid `redirect_uri`, invalid `client_id`, reused codes, expired codes, and bad secrets fail.
5. Confirm token and userinfo responses contain only the safe profile fields shown above.

## FWD Profile Linking

After token exchange, FWD should create or link its local profile by `trey_tv_uid`. Email is not shared by this bridge.
