# Source Structure

This app uses a light MVVM layout so screens do not become large files.

- `bootstrap`: root composition and app-level wiring.
- `core`: app-wide theme, storage, configuration, and utilities.
- `core/responsive`: breakpoint and layout helpers for phones, tablets, and web widths.
- `features`: domain features grouped by `models`, `repositories`, `services`, `viewmodels`, and `views`.
- `navigation`: React Navigation routes and navigator setup.
- `shared`: reusable UI components that are not tied to one feature.

Keep business rules in repositories and services, screen state in view models, and JSX in views.
