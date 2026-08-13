# ios-config.json — remote config for SMS Plus iOS

Served at `https://themejunky.github.io/sms-plus-privacy/ios-config.json` and read
by the app at every launch. The app caches the last good copy, so a change here
reaches devices on their next launch; if this file is unreachable or malformed,
the app keeps the cached copy — and a brand-new install falls back to
`planScreen: "paywall"`, `trialDays: 7`.

## Fields

| Field | Values | Meaning |
|---|---|---|
| `planScreen` | `"paywall"` | The last onboarding page shows both plans with prices and a real App Store purchase. |
| | `"freeTrial"` | One button, no card: premium is granted locally for `trialDays`, and the paywall waits until it ends. |
| | `"none"` | No last page at all — onboarding ends after the import step and the wizard reads 4/4. |
| `trialDays` | 1–90 | Length of the no-card trial. Values outside the range are clamped. Ignored unless `planScreen` is `"freeTrial"`. |
| `trialMessages` | 0 or more | The trial also ends after this many messages have passed through the app, sent or received. `0` means time is the only limit. |

## Examples

Ask for money on day one (current):

```json
{ "planScreen": "paywall", "trialDays": 7, "trialMessages": 0 }
```

Give a week free with no card, whichever comes first with 300 messages:

```json
{ "planScreen": "freeTrial", "trialDays": 7, "trialMessages": 300 }
```

Say nothing about money during onboarding:

```json
{ "planScreen": "none", "trialDays": 7, "trialMessages": 0 }
```

## Notes

- A trial already started keeps the length it began with only until this file
  changes: `trialDays` is read live, so shortening it can end a running trial.
  Lengthen freely, shorten deliberately.
- The trial grants the same entitlement as a subscription (no ads, whole theme
  catalogue, every effect). Nothing is charged, so nothing is refunded when it
  ends — the app simply returns to the free tier.
- Changing `planScreen` does not affect installs that already finished
  onboarding; it only decides what the next new install sees.
