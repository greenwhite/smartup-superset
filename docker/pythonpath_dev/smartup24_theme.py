# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""
Smartup24 Custom Theme for Apache Superset
==========================================

This module defines a custom branded theme for Smartup24 analytics platform.
It uses Ant Design's theme system integrated with Superset.

How to customize:
-----------------
1. Update SMARTUP24_COLORS with your brand colors from the style guide
2. Modify typography settings in SMARTUP24_TYPOGRAPHY
3. Adjust component styling in SMARTUP24_COMPONENTS
4. Set your logo path in SMARTUP24_BRAND

To apply this theme, import it in superset_config.py:
    from smartup24_theme import THEME_DEFAULT, THEME_DARK
"""

import os
from typing import Any

# =============================================================================
# SMARTUP24 BRAND COLORS
# =============================================================================
# Update these values based on your brand style guide (smartup_24_cutguide.pdf)
#
# Instructions:
# - Replace placeholder hex values with actual brand colors
# - Ensure sufficient contrast ratios for accessibility (WCAG 2.1 AA minimum)
# - Test colors in both light and dark modes

SMARTUP24_COLORS = {
    # Primary Brand Colors (from smartup_24_cutguide.pdf)
    # ---------------------------------------------------
    # Green - Main brand color for primary actions, buttons, active states
    "primary": "#2ECC71",  # Smartup24 Green

    # Secondary/Accent Colors
    # -----------------------
    "secondary": "#009EE0",   # Smartup24 Blue/Cyan
    "accent": "#2ECC71",      # Green accent

    # Semantic Colors
    # ---------------
    # Aligned with brand palette
    "success": "#2ECC71",    # Smartup24 Green - successful operations
    "warning": "#F5A623",    # Amber - warnings, attention needed
    "error": "#E74C3C",      # Red - errors, critical alerts
    "info": "#009EE0",       # Smartup24 Blue - informational messages

    # Neutral Colors
    # --------------
    # Grayscale palette with black accent from brand
    "neutral_50": "#F8F9FA",   # Lightest - elevated backgrounds
    "neutral_100": "#F1F3F5",  # Light backgrounds
    "neutral_200": "#E9ECEF",  # Borders, dividers
    "neutral_300": "#DEE2E6",  # Disabled states
    "neutral_400": "#ADB5BD",  # Placeholder text
    "neutral_500": "#6C757D",  # Secondary text
    "neutral_600": "#495057",  # Body text
    "neutral_700": "#343A40",  # Headings
    "neutral_800": "#212529",  # Dark text
    "neutral_900": "#1A1A1A",  # Smartup24 Black - primary text

    # Chart Colors
    # ------------
    # Brand-aligned palette for data visualization
    "chart_1": "#2ECC71",  # Smartup24 Green
    "chart_2": "#009EE0",  # Smartup24 Blue
    "chart_3": "#1A1A1A",  # Smartup24 Black
    "chart_4": "#F5A623",  # Amber
    "chart_5": "#E74C3C",  # Red
    "chart_6": "#9B59B6",  # Purple
    "chart_7": "#3498DB",  # Light Blue
    "chart_8": "#1ABC9C",  # Teal
}

# =============================================================================
# SMARTUP24 TYPOGRAPHY
# =============================================================================
# Font configuration - update based on your brand typography

SMARTUP24_TYPOGRAPHY = {
    # Primary Font Family (from smartup_24_cutguide.pdf)
    # --------------------------------------------------
    # Brand fonts: Circe (primary), Montserrat (secondary)
    # Using Montserrat as web fallback since Circe requires license
    "font_family": "Montserrat, 'Circe', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",

    # Code Font Family
    # ----------------
    # Monospace font for code, SQL, technical content
    "font_family_code": "'Fira Code', 'JetBrains Mono', 'Source Code Pro', Consolas, monospace",

    # Font URLs
    # ---------
    # Google Fonts - Montserrat (brand-approved alternative to Circe)
    "font_urls": [
        "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap",
        "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap",
    ],

    # Font Sizes (from brand guideline ratios)
    # ----------------------------------------
    # Base: 15pt = 100%, Heading: 40pt, Subheading: 30pt, Accent: 20pt
    "font_size_xs": "10",
    "font_size_sm": "12",
    "font_size_base": "14",
    "font_size_lg": "16",
    "font_size_xl": "20",
    "font_size_xxl": "28",
    "font_size_heading_1": "40",  # 100% - Main heading
    "font_size_heading_2": "30",  # 75% - Subheading
    "font_size_heading_3": "24",
    "font_size_heading_4": "20",  # 50% - Accent text
    "font_size_heading_5": "16",

    # Font Weights
    # ------------
    "font_weight_light": "300",
    "font_weight_normal": "400",
    "font_weight_medium": "500",
    "font_weight_semibold": "600",
    "font_weight_bold": "700",
}

# =============================================================================
# SMARTUP24 SPACING & LAYOUT
# =============================================================================

SMARTUP24_SPACING = {
    # Border Radius
    # -------------
    # Controls roundness of UI elements
    # Use 0 for sharp corners, higher values for more rounded look
    "border_radius_xs": 2,
    "border_radius_sm": 4,
    "border_radius": 6,      # Default
    "border_radius_lg": 8,
    "border_radius_xl": 12,

    # Spacing Scale (in pixels)
    # -------------------------
    "padding_xxs": 4,
    "padding_xs": 8,
    "padding_sm": 12,
    "padding": 16,           # Default
    "padding_md": 20,
    "padding_lg": 24,
    "padding_xl": 32,
    "padding_xxl": 48,

    # Control Heights
    # ---------------
    "control_height_xs": 24,
    "control_height_sm": 32,
    "control_height": 40,    # Default button/input height
    "control_height_lg": 48,
}

# =============================================================================
# SMARTUP24 BRAND ASSETS
# =============================================================================

SMARTUP24_BRAND = {
    # Logo Configuration
    # ------------------
    # Path to your logo file (relative to static assets or absolute URL)
    # Supported formats: SVG (recommended), PNG, JPG
    "logo_url": "/static/assets/images/smartup24_logo.svg",
    "logo_alt": "Smartup24 Analytics",
    "logo_height": "32px",
    "logo_margin": "16px 0",
    "logo_href": "/",

    # Loading Spinner (optional)
    # --------------------------
    # Custom loading animation - set to None to use default
    "spinner_url": None,
    "spinner_svg": None,

    # Favicon
    # -------
    # Supported formats: SVG, PNG, ICO
    "favicon_url": "/static/assets/images/smartup24_favicon.svg",
}

# =============================================================================
# SMARTUP24 ECHARTS OVERRIDES
# =============================================================================
# Custom styling for ECharts visualizations

SMARTUP24_ECHARTS = {
    # Global ECharts Options
    # ----------------------
    "global": {
        "textStyle": {
            "fontFamily": SMARTUP24_TYPOGRAPHY["font_family"],
        },
        "title": {
            "textStyle": {
                "fontWeight": SMARTUP24_TYPOGRAPHY["font_weight_semibold"],
                "fontSize": 16,
            },
        },
        "legend": {
            "textStyle": {
                "fontSize": 12,
            },
        },
        "tooltip": {
            "textStyle": {
                "fontSize": 12,
            },
            "borderRadius": SMARTUP24_SPACING["border_radius"],
        },
    },

    # Chart-Type Specific Overrides
    # -----------------------------
    "by_chart_type": {
        "pie": {
            "series": [{
                "label": {
                    "fontSize": 12,
                },
            }],
        },
        "table": {
            "textStyle": {
                "fontSize": 13,
            },
        },
    },
}

# =============================================================================
# SMARTUP24 COLOR SCHEMES FOR CHARTS
# =============================================================================
# Custom color palettes for data visualization

SMARTUP24_CATEGORICAL_COLORS = [
    {
        "id": "smartup24Primary",
        "description": "Smartup24 primary color palette",
        "label": "Smartup24 Primary",
        "isDefault": True,
        "colors": [
            SMARTUP24_COLORS["chart_1"],
            SMARTUP24_COLORS["chart_2"],
            SMARTUP24_COLORS["chart_3"],
            SMARTUP24_COLORS["chart_4"],
            SMARTUP24_COLORS["chart_5"],
            SMARTUP24_COLORS["chart_6"],
            SMARTUP24_COLORS["chart_7"],
            SMARTUP24_COLORS["chart_8"],
        ],
    },
    {
        "id": "smartup24Business",
        "description": "Professional business palette",
        "label": "Smartup24 Business",
        "isDefault": False,
        "colors": [
            "#1E40AF",  # Deep Blue
            "#047857",  # Emerald
            "#B45309",  # Amber
            "#7C3AED",  # Purple
            "#DB2777",  # Pink
            "#0891B2",  # Cyan
            "#65A30D",  # Lime
            "#DC2626",  # Red
        ],
    },
]

SMARTUP24_SEQUENTIAL_COLORS = [
    {
        "id": "smartup24Gradient",
        "description": "Smartup24 primary gradient",
        "label": "Smartup24 Gradient",
        "isDiverging": False,
        "isDefault": True,
        "colors": [
            "#E0F2FE",  # Lightest
            "#BAE6FD",
            "#7DD3FC",
            "#38BDF8",
            "#0EA5E9",
            "#0284C7",
            "#0369A1",
            "#075985",
            "#0C4A6E",  # Darkest
        ],
    },
]

# =============================================================================
# THEME DEFINITIONS
# =============================================================================

def build_theme_config(is_dark: bool = False) -> dict[str, Any]:
    """
    Build the complete theme configuration.

    Args:
        is_dark: Whether to build dark mode variant

    Returns:
        Complete theme configuration dictionary
    """
    return {
        "token": {
            # Brand
            "brandLogoAlt": SMARTUP24_BRAND["logo_alt"],
            "brandLogoUrl": SMARTUP24_BRAND["logo_url"],
            "brandLogoHeight": SMARTUP24_BRAND["logo_height"],
            "brandLogoMargin": SMARTUP24_BRAND["logo_margin"],
            "brandLogoHref": SMARTUP24_BRAND["logo_href"],
            "brandSpinnerUrl": SMARTUP24_BRAND["spinner_url"],
            "brandSpinnerSvg": SMARTUP24_BRAND["spinner_svg"],
            "brandIconMaxWidth": 40,

            # Colors
            "colorPrimary": SMARTUP24_COLORS["primary"],
            "colorLink": SMARTUP24_COLORS["primary"],
            "colorSuccess": SMARTUP24_COLORS["success"],
            "colorWarning": SMARTUP24_COLORS["warning"],
            "colorError": SMARTUP24_COLORS["error"],
            "colorInfo": SMARTUP24_COLORS["info"],

            # Typography
            "fontFamily": SMARTUP24_TYPOGRAPHY["font_family"],
            "fontFamilyCode": SMARTUP24_TYPOGRAPHY["font_family_code"],
            "fontUrls": SMARTUP24_TYPOGRAPHY["font_urls"],
            "fontSizeXS": SMARTUP24_TYPOGRAPHY["font_size_xs"],
            "fontSizeXXL": SMARTUP24_TYPOGRAPHY["font_size_xxl"],
            "fontSize": int(SMARTUP24_TYPOGRAPHY["font_size_base"]),
            "fontSizeSM": int(SMARTUP24_TYPOGRAPHY["font_size_sm"]),
            "fontSizeLG": int(SMARTUP24_TYPOGRAPHY["font_size_lg"]),
            "fontSizeXL": int(SMARTUP24_TYPOGRAPHY["font_size_xl"]),
            "fontSizeHeading1": int(SMARTUP24_TYPOGRAPHY["font_size_heading_1"]),
            "fontSizeHeading2": int(SMARTUP24_TYPOGRAPHY["font_size_heading_2"]),
            "fontSizeHeading3": int(SMARTUP24_TYPOGRAPHY["font_size_heading_3"]),
            "fontSizeHeading4": int(SMARTUP24_TYPOGRAPHY["font_size_heading_4"]),
            "fontSizeHeading5": int(SMARTUP24_TYPOGRAPHY["font_size_heading_5"]),
            "fontWeightLight": SMARTUP24_TYPOGRAPHY["font_weight_light"],
            "fontWeightNormal": SMARTUP24_TYPOGRAPHY["font_weight_normal"],
            "fontWeightStrong": int(SMARTUP24_TYPOGRAPHY["font_weight_semibold"]),

            # Spacing & Layout
            "borderRadius": SMARTUP24_SPACING["border_radius"],
            "borderRadiusSM": SMARTUP24_SPACING["border_radius_sm"],
            "borderRadiusLG": SMARTUP24_SPACING["border_radius_lg"],
            "borderRadiusXS": SMARTUP24_SPACING["border_radius_xs"],
            "padding": SMARTUP24_SPACING["padding"],
            "paddingXS": SMARTUP24_SPACING["padding_xs"],
            "paddingSM": SMARTUP24_SPACING["padding_sm"],
            "paddingLG": SMARTUP24_SPACING["padding_lg"],
            "paddingXL": SMARTUP24_SPACING["padding_xl"],
            "paddingXXS": SMARTUP24_SPACING["padding_xxs"],
            "controlHeight": SMARTUP24_SPACING["control_height"],
            "controlHeightSM": SMARTUP24_SPACING["control_height_sm"],
            "controlHeightLG": SMARTUP24_SPACING["control_height_lg"],
            "controlHeightXS": SMARTUP24_SPACING["control_height_xs"],

            # ECharts
            "echartsOptionsOverrides": SMARTUP24_ECHARTS["global"],
            "echartsOptionsOverridesByChartType": SMARTUP24_ECHARTS["by_chart_type"],

            # Animation
            "transitionTiming": 0.2,
        },
        "algorithm": "dark" if is_dark else "default",
    }


# Light Theme (Default)
THEME_DEFAULT: dict[str, Any] = build_theme_config(is_dark=False)

# Dark Theme
THEME_DARK: dict[str, Any] = build_theme_config(is_dark=True)

# Extra Color Schemes for Charts
EXTRA_CATEGORICAL_COLOR_SCHEMES: list[dict[str, Any]] = SMARTUP24_CATEGORICAL_COLORS
EXTRA_SEQUENTIAL_COLOR_SCHEMES: list[dict[str, Any]] = SMARTUP24_SEQUENTIAL_COLORS

# Enable Theme Administration UI
ENABLE_UI_THEME_ADMINISTRATION = True

# Application Branding
APP_NAME = "Smartup24 Analytics"
APP_ICON = SMARTUP24_BRAND["logo_url"]
APP_ICON_WIDTH = 150
FAVICONS = [{"href": SMARTUP24_BRAND["favicon_url"]}]

# Welcome Message
WELCOME_MESSAGE = "Welcome to Smartup24 Analytics"

# =============================================================================
# USAGE INSTRUCTIONS
# =============================================================================
"""
To use this theme:

1. Copy this file to your Superset configuration directory:
   - Docker: docker/pythonpath_dev/
   - Production: your PYTHONPATH location

2. Import the theme settings in your superset_config.py:

   from smartup24_theme import (
       THEME_DEFAULT,
       THEME_DARK,
       EXTRA_CATEGORICAL_COLOR_SCHEMES,
       EXTRA_SEQUENTIAL_COLOR_SCHEMES,
       ENABLE_UI_THEME_ADMINISTRATION,
       APP_NAME,
       APP_ICON,
       FAVICONS,
   )

3. Add your logo files to the static assets directory:
   - superset/static/assets/images/smartup24_logo.png
   - superset/static/assets/images/smartup24_favicon.png

4. Restart Superset to apply changes

5. (Optional) Use the Theme Administration UI to create additional themes:
   - Navigate to Settings > Theme Administration
   - Create new themes based on this configuration
"""
