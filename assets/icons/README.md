# CalorieCheck interface icons

`interface.svg` is a small, original set of generic line symbols authored for V2-D2: `home`, `search`, `calendar`, `person`, `check`, `info`, `warning`, `close`, `minus`, and `plus`.

No icon package, reference-app artwork, image generator, font, script, or external resource is used. Geometry is local SVG markup and inherits the `.ui-icon` stroke/color rules in `css/components.css`.

Use alongside visible text. Decorative instances use `aria-hidden="true"`; an icon-only button still needs its own accessible name. Reference a symbol with `<use href="…/interface.svg#calendar">`. Vite rewrites specimen asset URLs to a hashed local file during build.
