# Next.js Free TV API route template

Copy this folder's `app/api/free-tv` routes and `lib/free-tv` helper files into the real Trey TV Next.js backend if those routes do not already exist.

These files are templates because the provider's exact endpoint names were not supplied. They assume common paths:

- `status`
- `channels`
- `search`
- `schedule`
- `channels/[id]`
- `channels/[id]/schedule`

If the Free TV provider docs use different paths, change only the `path` values passed to `requestFreeTvProvider()`.

Never put `FREE_TV_API_KEY` or `FREE_TV_ACCESS_TOKEN` in the Vite TV client.
