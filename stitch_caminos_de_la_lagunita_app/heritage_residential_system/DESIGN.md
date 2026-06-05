---
name: Heritage Residential System
colors:
  surface: '#fbf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#fbf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#eae8e5'
  surface-container-highest: '#e4e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#3f4947'
  inverse-surface: '#30312f'
  inverse-on-surface: '#f2f0ed'
  outline: '#6f7978'
  outline-variant: '#bfc8c7'
  surface-tint: '#296864'
  primary: '#0f5551'
  on-primary: '#ffffff'
  primary-container: '#2f6d69'
  on-primary-container: '#aeece7'
  inverse-primary: '#94d2cd'
  secondary: '#785919'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#795a1a'
  tertiary: '#3d503e'
  on-tertiary: '#ffffff'
  tertiary-container: '#556855'
  on-tertiary-container: '#d0e6ce'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0eee9'
  primary-fixed-dim: '#94d2cd'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#05504c'
  secondary-fixed: '#ffdea6'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#d3e8d0'
  tertiary-fixed-dim: '#b7ccb5'
  on-tertiary-fixed: '#0e1f10'
  on-tertiary-fixed-variant: '#394b39'
  background: '#fbf9f6'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2df'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  safety-area: 16px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  max-width: 1280px
---

## Brand & Style

The design system is crafted for a high-end residential environment, emphasizing security, community, and understated luxury. The brand personality is **established, serene, and professional**, aimed at providing residents with a seamless management experience that feels as premium as their physical surroundings.

The visual style follows a **Modern Corporate** approach with a focus on **Flat Design** principles. It avoids complex gradients and heavy shadows in favor of structured layouts, crisp lines, and a sophisticated color palette inspired by nature and architectural materials. The interface prioritizes clarity and efficiency, using generous whitespace to ensure the user never feels overwhelmed by administrative tasks.

## Colors

The color palette is rooted in an earthy, sophisticated spectrum that reflects the landscape of a premium estate.

- **Primary (Deep Turquoise Green):** Used for main actions, navigation headers, and primary branding elements. It conveys stability and growth.
- **Secondary (Ochre Gold):** Reserved for highlights, premium status indicators, and subtle accents that suggest quality.
- **Tertiary (Moss Green) & Accent (Soft Terracotta):** Utilized for categorization, secondary buttons, and decorative elements to provide visual variety without breaking the natural harmony.
- **Background (Off-White/Bone):** The foundational canvas for the entire application, providing a warmer, more inviting feel than pure white while maintaining high legibility.

## Typography

This design system utilizes a dual-font strategy to balance heritage with utility.

- **Headlines:** **EB Garamond** provides a classic, authoritative serif look for titles and identity-driven moments. It should be used for all page headers and prominent section titles.
- **Body & Forms:** **Inter** is the functional workhorse, ensuring maximum legibility for data-heavy management screens, residential lists, and complex forms. 
- **Hierarchy:** Maintain a clear distinction between editorial headings (Serif) and interactive/informational text (Sans-Serif). Labels should use slightly increased letter spacing and semi-bold weights for quick scanning.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model for desktop to maintain an organized, gallery-like feel, and a **Fluid Grid** for mobile devices.

- **Grid:** A 12-column grid is used for desktop (max-width 1280px). 
- **Safety Area:** A mandatory 16px (2 units) safety area must be maintained around logos and primary branding icons to ensure visual integrity.
- **Rhythm:** All spacing is based on an 8px (base) scale. Padded containers should use 24px or 32px of internal spacing to maintain "generous whitespace" as requested.
- **Breakpoints:**
  - **Mobile:** < 600px (1 column, 16px margins)
  - **Tablet:** 600px - 1024px (6 columns, 24px margins)
  - **Desktop:** > 1024px (12 columns, fixed centered layout)

## Elevation & Depth

In alignment with the **Flat / Material** design principles, this system avoids diffuse, blurry shadows. Instead, it creates hierarchy through:

1.  **Tonal Layering:** Surfaces are differentiated by slight shifts in background color (e.g., a primary container using a slightly different tint than the main `#FAF8F5` background).
2.  **Low-Contrast Outlines:** Elements like cards and input fields use subtle 1px borders in a muted version of the Neutral or Moss Green color to define boundaries without adding visual "weight."
3.  **Flat Overlays:** High-priority elements (like modals) use a solid semi-transparent backdrop (dimmer) but remain flat on the Z-axis, utilizing crisp borders to denote separation from the background.

## Shapes

The shape language is structured and dependable. A consistent **8px border radius** is applied to all interactive elements, including buttons, input fields, and containers.

- **Small Components:** Checkboxes and small tags use a 4px radius for precision.
- **Primary Elements:** Buttons and form fields strictly follow the 8px (0.5rem) rule.
- **Large Containers:** Cards and modals may use up to 16px (1rem) for a softer, more architectural feel, but never exceed this to maintain the professional, flat aesthetic.

## Components

- **Buttons:** Use solid color fills for primary actions (`#2F6D69`) with white text. Secondary buttons should use the Ochre Gold or an outlined Moss Green style. All buttons feature the 8px corner radius.
- **Input Fields:** Clean, outlined boxes with 8px radius. Use a 1px border. Labels should remain persistent or use a clear "top-aligned" layout to assist accessibility in long forms.
- **Cards:** White or very light tinted backgrounds with a 1px border and no shadow. Used for grouping resident information, maintenance requests, or community news.
- **Chips/Badges:** Small, 4px rounded indicators for status (e.g., "Paid," "Pending," "Maintenance"). Use low-saturation background tints from the palette.
- **Lists:** Clean rows with 1px horizontal dividers. Use the secondary serif font for the main list item title and the sans-serif for metadata.
- **Management-Specific Components:** Dedicated "Visitor Access" cards and "Payment History" tables should prioritize high-contrast text and clear, flat iconography.