# Content Creator shop refinements

Scope: smaller header branding and cart artwork; weekly photo notice; personalized
introduction card; expandable process/custom-photo/video/free-photo FAQs; existing
visitor interest answers on shop pages; coordinated footer. Server and client use
the same shared markup. Open FAQs, decoded images and saved answers survive cart
updates. No image request path or image quality setting changed.

Payment behavior follows the requested "take today, pay on the first" offer:
new paid orders release their purchased originals immediately. Payment remains
pending and unconfirmed, with a separate download-release flag, monthly payment
schedule and next calendar month's first day calculated in Europe/Vienna. Heart
shows the due date and keeps payment confirmation separate. Existing orders retain
their original release policy; free downloads retain their existing flow. Receipt
access and purchased-file membership checks still apply.

Validation: 99 targeted creator unit/DOM regression tests passed; npm run build passed.
The tracked social bundle files were unchanged by the build.
No production data used. No Playwright or smoke run (repository instruction).
Real mobile browser/iOS visual verification was not performed in this environment.

## Follow-up: edit photos in existing packages

Each package now supports selecting multiple additional photos. Files use the
existing shop upload path and free/paid preview policy, and become package members
only after all uploads complete. Removing a photo within a package affects that
package only; shared photos and purchased originals remain intact. Empty packages
stay editable and can be refilled. Existing page-wide removal remains available.
Validation: 12 package/upload tests passed, including partial upload failure,
retry, size validation and shared-image preservation. Build passed; tracked
bundles unchanged. Real mobile visual check was not performed.
