# Creator viewer browser tint

The photo viewer already updates `theme-color` and the document background.
The underlying sticky shop header still had a light background, while the
viewer header had no explicit background of its own. Safari 26 may sample
viewport-constrained edge elements for browser tint, so both headers now use
the viewer background while `data-cc-viewer="1"` is active. The viewer header
is explicitly sticky at the top edge. Closing the viewer restores the normal
header through the existing state selector.

The existing `color-scheme` metadata also switches to dark for the viewer and
restores its original value on close. The stylesheet URL is versioned to
ensure clients receive the updated CSS.

Reference: WebKit engineer explanation of edge tint sampling:
https://bugs.webkit.org/show_bug.cgi?id=301756#c2

This addresses the page-side sampling inputs. Actual toolbar tint remains
controlled by Safari or its embedding application. Real iPhone verification
is still required; Node tests cannot render native browser chrome.
