# ios-config.json — remote config for SMS Plus iOS

Served at `https://themejunky.github.io/sms-plus-privacy/ios-config.json` and read
by the app at every launch. The app caches the last good copy, so a change here
reaches devices on their next launch; if this file is unreachable or malformed,
the app keeps the cached copy — and a brand-new install falls back to
`planScreen: "paywall"`, `trialDays: 7`.

`ios-config.example.json` in this folder lists every key the app understands with
the shipped defaults spelled out. It is documentation, not the served file — the
app never reads it.

## Fields

| Field | Values | Meaning |
|---|---|---|
| `planScreen` | `"paywall"` | The last onboarding page shows both plans with prices and a real App Store purchase. |
| | `"freeTrial"` | One button, no card: premium is granted locally for `trialDays`, and the paywall waits until it ends. |
| | `"none"` | No last page at all — onboarding ends after the import step and the wizard reads 4/4. |
| `trialDays` | 1–90 | Length of the no-card trial. Values outside the range are clamped. Ignored unless `planScreen` is `"freeTrial"`. |
| `trialMessages` | 0 or more | The trial also ends after this many messages have passed through the app, sent or received. `0` means time is the only limit. |
| `yearlyProductID` | product id, or absent | Which App Store product the yearly plan sells. **Absent = the identifier the app shipped with**, which is what you want unless you are moving to a new price point. |
| `monthlyProductID` | product id, or absent | Same, for the monthly plan. |
| `lifetimeProductID` | product id, or absent | Same, for the one-off lifetime purchase. |

Blank or whitespace-only product ids are treated as absent, so a half-finished
edit falls back to the shipped identifier rather than asking the App Store for a
product called nothing.

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

Move only the yearly plan to a cheaper product, leaving monthly and lifetime
alone:

```json
{
  "planScreen": "paywall",
  "trialDays": 7,
  "trialMessages": 0,
  "yearlyProductID": "com.themejunky.smsplus.ios.premium.yearly.b"
}
```

## Changing a price point

App Store Connect will not change an existing subscription's price under
existing subscribers, so a new price means a **new product**. The sequence:

1. Create the new product in App Store Connect (themejunkyapps) and get it to
   *Ready to Submit*. A product that is not there yet returns nothing to the
   app.
2. Add its identifier here under the matching key.
3. Devices pick it up on their next launch.

Existing subscribers keep premium throughout. The app checks entitlements
against the union of the identifiers named here *and* the ones it shipped with,
precisely so that retiring a product cannot demote the people still paying for
it.

To go back, delete the key. There is no rollback to get wrong.

## Notes

- A trial already started keeps the length it began with only until this file
  changes: `trialDays` is read live, so shortening it can end a running trial.
  Lengthen freely, shorten deliberately.
- `trialDays` also decides when the "your free trial ends tomorrow" reminder
  fires — a day before the end, at the wall-clock hour the trial started.
  Changing `trialDays` mid-trial moves that reminder on the next launch.
  `trialDays: 1` gets no reminder at all: its "day before" is the moment the
  trial began.
- The trial grants the same entitlement as a subscription (no ads, whole theme
  catalogue, every effect). Nothing is charged, so nothing is refunded when it
  ends — the app simply returns to the free tier. Creating a scheduled send
  goes back behind the paywall when it does; messages already scheduled still
  go out.
- Changing `planScreen` does not affect installs that already finished
  onboarding; it only decides what the next new install sees.
- Unknown keys are ignored, so adding a key a shipped build does not know about
  is safe. An unknown *value* for `planScreen` is not: the file is rejected and
  the cached copy stays in force.
