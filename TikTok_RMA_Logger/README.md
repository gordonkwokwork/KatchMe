# TikTok RMA Logger

A comprehensive RMA tracking system for TikTok Shop returns with automated logging and employee tracking.

## Features

- **Web Scanner Interface** - Clean, mobile-friendly tracking number scanner
- **Employee Management** - Dropdown selection from Google Sheets
- **TikTok Shop Integration** - Tampermonkey userscript for automated data capture
- **Google Sheets Logging** - Automated data storage with duplicate detection
- **Real-time Updates** - Instant logging with visual feedback

## Components

### Web Interface (`RMA_Tracking.html`)
- Responsive tracking scanner
- Employee dropdown from Google Sheets
- Recent scans history
- Mobile-optimized design

### Tampermonkey Script (`TikTok RMA Tracker.user.js`)
- Automatically detects TikTok Shop return orders
- Extracts Order ID and Return ID from page data
- Adds employee dropdown to TikTok forms
- Prevents duplicate submissions

### Google Apps Scripts
- `RMA_Team.gs` - Handles tracking number submissions
- `SheetUpdater.gs` - Manages RMA data with duplicate prevention

## Setup

1. Create Google Sheets with `Log`, `Name`, and `rma` tabs
2. Deploy Google Apps Scripts as web apps
3. Configure API keys and sheet IDs in HTML file
4. Install Tampermonkey script for TikTok Shop integration
5. Set sheet permissions to "Anyone with link can edit"

## Usage

1. Select employee from dropdown
2. Scan or enter tracking number
3. Data automatically logs to Google Sheets
4. View recent scans in web interface

## Requirements

- Google Sheets access
- Google Apps Script deployment
- Tampermonkey browser extension (for TikTok integration)