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

## Keyboard Plus iOS — pricing test (`keyboardPlusPricingExperiment`)

Keyboard Plus iOS reads this same file. It ignores every SMS Plus product key
and reads only this namespaced block; SMS Plus iOS ignores the block. Absent,
disabled or killed, Keyboard Plus sells its shipped products
(`com.themejunky.keyboardplusapp.premium.annual` + `.monthly`).

```json
{
  "keyboardPlusPricingExperiment": {
    "enabled": true,
    "killSwitch": false,
    "forcedArm": null,
    "arms": [
      { "id": "pricing_a_current", "weight": 50 },
      { "id": "pricing_b_weekly", "weight": 50,
        "annualProductID": "com.themejunky.keyboardplusapp.premium.annual.b",
        "weeklyProductID": "com.themejunky.keyboardplusapp.premium.weekly" }
    ]
  }
}
```

| Field | Values | Meaning |
|---|---|---|
| `enabled` | bool, default `false` | `false` → no bucket is drawn, every install gets the shipped products. |
| `killSwitch` | bool, default `false` | `true` → everyone, including assigned installs, gets the shipped products. |
| `forcedArm` | arm id or null | That arm for every install, including ones already assigned. The saved arm is kept, so deleting the key restores the split. This is how the test is concluded without a release. |
| `arms[].id` | string | Reported as the arm name; use the Android ids so reports line up. |
| `arms[].weight` | int > 0 | Relative share for new installs only; changing weights never moves an assigned install. |
| `arms[].annualProductID` | product id, or absent | Absent = the shipped annual product. |
| `arms[].monthlyProductID` / `weeklyProductID` | product id, or absent | The arm's short plan. Name one; monthly wins if both are given. |

An arm that names no product at all (`{ "id": "pricing_a_current", "weight": 50 }`)
is the shipped catalog: annual + monthly. Once an arm names any product it sells
exactly what it names, so `annualProductID` alone is an annual-only arm.

Rules:

- Every product named here must exist in App Store Connect (themejunkyapps)
  and be *Ready to Submit* before `enabled` flips to `true`, otherwise that
  arm's paywall shows unavailable plans. For arm B that means creating
  `…premium.weekly` (USD 4.99/week, 7-day free trial) and `…premium.annual.b`
  (USD 48.99/year, 7-day free trial) in the existing `Keyboard Plus Premium`
  subscription group.
- The app pre-selects the arm's short plan (weekly in B, monthly in A).
- Each install draws its own bucket (separate from the import-flow test) and
  keeps its arm; the arm is re-read at every launch, so `forcedArm` and
  `killSwitch` reach existing installs on their next launch.
- Entitlements accept any `com.themejunky.keyboardplusapp.premium.*` product,
  so retiring an arm never demotes someone still paying for it.
- The arms map 1:1 to products, so App Store Connect sales by product are the
  outcome measure per arm (same reading as the Android test).

## SMS Plus iOS — pricing test (`smsPlusPricingExperiment`)

SMS Plus iOS reads this namespaced block from the same file; Keyboard Plus
ignores it. The block is off by default. Absent or disabled, the existing
top-level `yearlyProductID` / `monthlyProductID` / `lifetimeProductID`
overrides still work. A kill switch deliberately restores the shipped catalog.

```json
{
  "smsPlusPricingExperiment": {
    "enabled": false,
    "killSwitch": false,
    "forcedArm": null,
    "arms": [
      { "id": "pricing_a_current", "weight": 50 },
      { "id": "pricing_b_priceset", "weight": 50,
        "yearlyProductID": "com.themejunky.smsplus.ios.premium.yearly.b",
        "monthlyProductID": "com.themejunky.smsplus.ios.premium.monthly.b",
        "lifetimeProductID": "com.themejunky.smsplus.ios.premium.lifetime.b" }
    ]
  }
}
```

Owner decision 2026-09-03: arm A = the shipped catalog (monthly USD 9.99,
yearly USD 69.99, lifetime); arm B = the existing price set B (monthly.b USD
5.99, yearly.b USD 39.99, lifetime.b), no weekly. The block above is that
mapping; flip `enabled` to `true` only once the SMS Plus app version carrying
the split and the three B products are approved.

| Field | Values | Meaning |
|---|---|---|
| `enabled` | bool, default `false` | `false` → no pricing bucket is drawn; the top-level product overrides, if any, remain in force. |
| `killSwitch` | bool, default `false` | `true` → everyone, including assigned installs, gets the shipped yearly + monthly + lifetime catalog. |
| `forcedArm` | arm id or null | That arm wins on the next launch without erasing the install's saved arm. Removing it restores the saved assignment. |
| `arms[].id` | nonblank string | Stable arm name. Blank ids are ignored. |
| `arms[].weight` | int > 0 | Relative share for new installs. Existing saved arms do not move when weights change. |
| `arms[].yearlyProductID` | product id, or absent | In an arm that names any product, absent yearly falls back to the shipped yearly product. |
| `arms[].monthlyProductID` / `weeklyProductID` | product id, or absent | The arm's short plan. Monthly wins if both are present. |
| `arms[].lifetimeProductID` | product id, or absent | Lifetime is offered only when the arm names it. |

An arm naming no product is the complete shipped catalog. Once an arm names
any product it sells exactly the named slots, with only the yearly fallback
described above. The paywall order is yearly, monthly-or-weekly, then lifetime;
the short plan is preselected (weekly when present, otherwise monthly).

Rules:

- The assignment uses `smsplus.onboarding.pricingBucket.v1` and
  `smsplus.onboarding.pricingArm.v1`, separate from every onboarding/import
  decision, and is re-resolved from cached config on every launch.
- Every named product must exist in the `themejunkyapps` App Store Connect
  account and be approved before `enabled` becomes `true`. The B products'
  metadata was completed on 2026-09-03; they are reviewed together with the
  app version. A weekly slot is supported by the app but no weekly product
  exists for SMS Plus iOS today.
- Entitlements keep the shipped products, every configured arm product, and
  any retired product under `com.themejunky.smsplus.ios.premium.*` valid.
- SMS Plus currently has no purchase/paywall analytics event pipeline; results
  can be read by product in App Store Connect after the owner enables a final
  product-to-arm mapping.
