# Smartup24 Custom Theme for Apache Superset

This guide documents how to customize and deploy the Smartup24 branded theme for Apache Superset.

## Overview

The Smartup24 theme system provides:
- **Brand Colors**: Primary, secondary, and semantic color palette
- **Typography**: Custom fonts with fallbacks
- **Component Styling**: Buttons, cards, forms, tables
- **Dark Mode**: Automatic dark theme variant
- **Chart Colors**: Custom color schemes for visualizations
- **CSS Overrides**: Fine-grained styling control

## File Structure

```
docker/pythonpath_dev/
├── smartup24_theme.py                          # Main theme configuration
├── smartup24_custom_css.py                     # CSS overrides
└── superset_config_docker.py.smartup24.example # Example integration

superset/static/assets/images/
├── smartup24_logo.png                          # Your logo (add this)
└── smartup24_favicon.png                       # Your favicon (add this)
```

## Quick Start

### 1. Update Brand Colors

Edit `docker/pythonpath_dev/smartup24_theme.py` and update the `SMARTUP24_COLORS` dictionary:

```python
SMARTUP24_COLORS = {
    # Primary Brand Color - replace with your brand color
    "primary": "#YOUR_PRIMARY_COLOR",

    # Secondary colors
    "secondary": "#YOUR_SECONDARY_COLOR",
    "accent": "#YOUR_ACCENT_COLOR",

    # Semantic colors (adjust if needed)
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "info": "#3B82F6",
}
```

### 2. Configure Typography

Update fonts in `SMARTUP24_TYPOGRAPHY`:

```python
SMARTUP24_TYPOGRAPHY = {
    "font_family": "YourFont, sans-serif",
    "font_urls": [
        "https://fonts.googleapis.com/css2?family=YourFont:wght@400;500;600&display=swap",
    ],
}
```

### 3. Add Logo Files

Place your logo files in `superset/static/assets/images/`:

- `smartup24_logo.png` - Main logo (recommended: 150x32px, transparent PNG)
- `smartup24_favicon.png` - Favicon (recommended: 32x32px)

Update paths in `SMARTUP24_BRAND`:

```python
SMARTUP24_BRAND = {
    "logo_url": "/static/assets/images/smartup24_logo.png",
    "logo_alt": "Smartup24 Analytics",
    "logo_height": "32px",
}
```

### 4. Activate the Theme

Copy the example config:

```bash
cp docker/pythonpath_dev/superset_config_docker.py.smartup24.example \
   docker/pythonpath_dev/superset_config_docker.py
```

### 5. Restart Superset

```bash
docker-compose restart superset_app superset_worker
```

## Detailed Configuration

### Color System

The theme uses a semantic color system:

| Token | Purpose | Usage |
|-------|---------|-------|
| `colorPrimary` | Brand color | Buttons, links, active states |
| `colorSuccess` | Positive | Success messages, positive metrics |
| `colorWarning` | Caution | Warnings, attention needed |
| `colorError` | Negative | Errors, critical alerts |
| `colorInfo` | Neutral | Information messages |

### Typography Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `fontFamily` | Inter | Primary UI font |
| `fontFamilyCode` | Fira Code | Monospace for SQL/code |
| `fontSize` | 14px | Base font size |
| `fontWeightStrong` | 600 | Bold text weight |

### Spacing & Layout

| Token | Default | Description |
|-------|---------|-------------|
| `borderRadius` | 6px | Default corner radius |
| `padding` | 16px | Default padding |
| `controlHeight` | 40px | Button/input height |

### Dark Mode

Dark mode is automatically generated from your light theme. The theme system:
1. Uses Ant Design's dark algorithm
2. Inverts backgrounds and text colors
3. Adjusts contrast for readability

To disable dark mode, set in your config:
```python
THEME_DARK = None
```

### Chart Color Schemes

Custom color palettes for data visualization are defined in `SMARTUP24_CATEGORICAL_COLORS`:

```python
SMARTUP24_CATEGORICAL_COLORS = [
    {
        "id": "smartup24Primary",
        "label": "Smartup24 Primary",
        "isDefault": True,
        "colors": ["#0066CC", "#10B981", "#F59E0B", ...],
    },
]
```

## CSS Customization

### Using CSS Variables

The theme provides CSS variables for additional customization:

```css
:root {
  --smartup24-primary: #0066CC;
  --smartup24-bg-base: #FFFFFF;
  --smartup24-border: #E5E7EB;
}
```

### Adding Custom CSS

1. Edit `docker/pythonpath_dev/smartup24_custom_css.py`
2. Add your styles to `EXTRA_CUSTOM_CSS`
3. Import in your config:
   ```python
   from smartup24_custom_css import CUSTOM_CSS
   ```

### Component-Specific Styling

Common customization points:

```css
/* Navigation */
.navbar { /* header styles */ }

/* Dashboard cards */
.chart-container { /* chart wrapper */ }

/* Tables */
.ant-table { /* data tables */ }

/* SQL Lab */
.ace_editor { /* SQL editor */ }
```

## Theme Administration UI

Enable the admin UI to create additional themes:

```python
ENABLE_UI_THEME_ADMINISTRATION = True
```

Access via: Settings > Theme Administration

Features:
- Create multiple themes
- Set system default themes
- Apply themes per dashboard
- Export/import themes

## Using Ant Design Theme Editor

For advanced customization:

1. Visit [Ant Design Theme Editor](https://ant.design/theme-editor)
2. Customize tokens visually
3. Export JSON configuration
4. Use in your theme config:

```python
THEME_DEFAULT = {
    "token": {
        # Paste exported tokens here
    },
    "algorithm": "default",
}
```

## Limitations & Considerations

### Font Loading
- Fonts are loaded from allowed domains only
- Default allowed: Google Fonts, Adobe Fonts (Typekit)
- Max 15 font URLs per theme

### CSS Specificity
- Some Superset components use inline styles
- Use `!important` sparingly for overrides
- Test thoroughly after upgrades

### Browser Support
- Custom CSS variables require modern browsers
- Scrollbar styling is WebKit-only (Chrome, Safari, Edge)

### Performance
- Minimize custom CSS for faster load times
- Use system fonts when possible
- Optimize logo file sizes

## Troubleshooting

### Theme Not Applied
1. Check Superset logs for import errors
2. Verify file paths are correct
3. Clear browser cache
4. Restart Superset services

### Logo Not Showing
1. Verify file exists in static assets
2. Check file permissions
3. Confirm path in `SMARTUP24_BRAND["logo_url"]`

### Fonts Not Loading
1. Check browser console for blocked requests
2. Verify URLs are HTTPS
3. Confirm domain is in `THEME_FONT_URL_ALLOWED_DOMAINS`

### Dark Mode Issues
1. Some charts may need manual color adjustments
2. Check `echartsOptionsOverrides` for chart-specific settings
3. Test all chart types in dark mode

## Maintenance

### Updating After Superset Upgrades

1. Review Superset release notes for theme changes
2. Test theme in staging environment
3. Update CSS selectors if components changed
4. Verify Ant Design token compatibility

### Version Control

Keep your theme files in version control:

```bash
git add docker/pythonpath_dev/smartup24_*.py
git add superset/static/assets/images/smartup24_*
git commit -m "feat: Smartup24 custom theme"
```

## Example: Complete Brand Setup

```python
# docker/pythonpath_dev/smartup24_theme.py

SMARTUP24_COLORS = {
    "primary": "#2563EB",      # Blue-600
    "secondary": "#64748B",    # Slate-500
    "accent": "#0D9488",       # Teal-600
    "success": "#059669",      # Emerald-600
    "warning": "#D97706",      # Amber-600
    "error": "#DC2626",        # Red-600
    "info": "#0284C7",         # Sky-600
}

SMARTUP24_TYPOGRAPHY = {
    "font_family": "Plus Jakarta Sans, Inter, sans-serif",
    "font_urls": [
        "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
    ],
}

SMARTUP24_SPACING = {
    "border_radius": 8,        # Rounded corners
    "padding": 16,
    "control_height": 40,
}
```

## Support

For issues with:
- **Superset**: [GitHub Issues](https://github.com/apache/superset/issues)
- **Ant Design**: [Ant Design Documentation](https://ant.design/docs/react/customize-theme)
- **Theme Editor**: [Ant Design Theme Editor](https://ant.design/theme-editor)
