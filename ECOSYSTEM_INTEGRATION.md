# FWD + Trey TV Ecosystem Integration

FWD and Trey TV stay separate public products. FWD is its own GIF/reaction app with its own branding, domain, users, uploads, favorites, collections, picker API, and embed controls. Trey TV is its own entertainment/social platform with its own branding, users, profiles, messages, comments, creator channels, and public UID authority.

They work together only through a secure integration layer:

- Verified shared UID identity
- Continue with Trey TV login
- Embedded FWD picker
- Picker API keys and allowed origins
- Safe usage tracking

## Product Boundary

FWD should say:

- FWD
- Powered by FWD
- Continue with Trey TV
- Connected to Trey TV
- Send with FWD

Trey TV should say:

- FWD
- GIFs & reactions
- Powered by FWD

Do not rename FWD to Trey TV GIFs. FWD should feel like a real sibling product, not a Trey TV page.

## Identity

Trey TV is the authority for the public 16-digit UID. FWD stores a Trey TV UID only after the user verifies the connection through Continue with Trey TV.

FWD should store these fields on its own profile record:

```text
connected_trey_tv_uid
trey_tv_display_name
trey_tv_avatar_url
trey_tv_profile_url
identity_provider = trey_tv
identity_verified_at
identity_sync_status
```

FWD should use `connected_trey_tv_uid` as the shared identity reference. Trey TV internal auth IDs and private database IDs must not become public identity.

## Continue with Trey TV

FWD starts the browser flow against Trey TV:

```text
GET https://tv.treytrizzy.com/api/fwd/oauth/authorize
  ?client_id=<FWD_CLIENT_ID>
  &redirect_uri=https%3A%2F%2Ffwd.treytv.com%2Fauth%2Ftrey-tv%2Fcallback
  &response_type=code
  &scope=profile
  &state=<opaque-random-state>
```

Trey TV validates the FWD client and redirect URI, signs the user into Trey TV if needed, shows consent, then returns an authorization code and unchanged `state`.

FWD backend exchanges the code server-side:

```text
POST https://tv.treytrizzy.com/api/fwd/oauth/token
```

The response gives FWD a short-lived bearer token plus safe public profile fields. FWD then creates or links its own user profile by `trey_tv_uid` and can show **Connected to Trey TV**.

## FWD Picker In Trey TV

Trey TV opens FWD as an add-on from plus-button drawers in:

- messages
- comments
- group chats
- watch parties
- creator channels
- feed replies

The Trey TV side embeds:

```text
https://fwd.treytv.com/embed/picker?key=<PUBLIC_KEY>&source_platform=trey_tv&context=message&trey_tv_uid=<PUBLIC_UID>
```

FWD remains visually FWD inside the embed. Trey TV labels it **FWD**, **GIFs & reactions**, and **Powered by FWD**.

When a GIF is selected, FWD posts a safe payload to the parent:

```json
{
  "type": "fwd:gif:selected",
  "gif": {
    "gif_id": "gif_123",
    "title": "Reaction title",
    "url": "https://fwd.treytv.com/cdn/gifs/gif_123.gif",
    "preview_url": "https://fwd.treytv.com/cdn/gifs/gif_123.webp",
    "width": 480,
    "height": 270
  }
}
```

Trey TV validates the `postMessage` origin, attaches the selected GIF to the local message/comment flow, and does not call the FWD database directly.

## Picker Keys

FWD owns picker API keys. Trey TV only receives a public embed key safe for browser use.

Recommended FWD-owned tables:

```sql
create table picker_api_keys (
  id uuid primary key default gen_random_uuid(),
  public_key text unique not null,
  key_hash text unique not null,
  app_name text not null,
  allowed_origins text[] not null,
  allowed_contexts text[] not null default array['message','comment','group_chat','watch_party','creator_channel','feed_reply'],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

FWD should expose a `verify-picker-key` edge function that accepts:

```json
{
  "public_key": "pk_fwd_...",
  "origin": "https://tv.treytrizzy.com",
  "context": "message"
}
```

It returns success only when:

- the key exists and is active
- the origin is allowlisted
- the context is allowlisted

If denied, FWD shows:

```text
This embed is not allowed on this domain.
```

Allowed Trey TV origins should include:

```text
https://tv.treytrizzy.com
https://treytv.com
https://www.treytv.com
http://localhost:<dev-port>
```

## Usage Tracking

FWD owns usage records. Trey TV sends only safe context through the picker URL and selected GIF flow.

Recommended FWD-owned usage fields:

```text
gif_id
source_platform = trey_tv
context = message/comment/group_chat/watch_party/creator_channel/feed_reply
trey_tv_uid
created_at
```

Do not track private Trey TV data. Do not require FWD to access Trey TV tables.

## Data Ownership

Trey TV owns:

- Trey TV profiles
- Trey TV messages
- Trey TV comments
- Trey TV creator channels
- Trey TV public UID authority

FWD owns:

- GIFs
- GIF uploads
- GIF search
- GIF favorites
- GIF collections
- picker keys
- FWD user profiles
- FWD usage records

Shared safely:

- public Trey TV UID
- public display name
- public avatar URL
- public profile URL
- selected GIF payload
- safe usage context

Never share:

- service role keys
- database passwords
- internal auth IDs as public identity
- raw session tokens
- private emails unless user authorizes it
- admin roles
- private profile fields

## Future Apps

Future apps can integrate the same way:

1. Register an OAuth client or picker key server-side.
2. Allowlist exact redirect URIs and embed origins.
3. Use the Trey TV public UID for shared identity.
4. Keep app-owned data in the app's own database.
5. Exchange only signed, scoped, short-lived, server-validated payloads.
