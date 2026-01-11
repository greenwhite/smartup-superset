# Smartup24 Logo Assets

This directory contains placeholder logo assets for the Smartup24 theme.

## How to Deploy

Copy these files to the Superset static assets directory:

```bash
cp smartup24_logo.svg /path/to/superset/static/assets/images/
cp smartup24_favicon.svg /path/to/superset/static/assets/images/
```

For Docker deployments, mount the files or copy them during build.

## Replacing with Your Brand Assets

1. Replace `smartup24_logo.svg` with your actual logo
2. Replace `smartup24_favicon.svg` with your favicon
3. Supported formats: SVG (recommended), PNG, JPG

## Recommended Dimensions

- **Logo**: 150x32 pixels (or proportional)
- **Favicon**: 32x32 pixels

## File Naming

If you change filenames, update the paths in:
- `docker/pythonpath_dev/smartup24_theme.py` → `SMARTUP24_BRAND` section
