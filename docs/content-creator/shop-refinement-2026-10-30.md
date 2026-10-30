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
