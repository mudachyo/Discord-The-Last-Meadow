# Discord Game Bot

<div align="center">
    <img src="https://img.shields.io/badge/Discord-Game%20Automation-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Badge"/>
    <img src="https://img.shields.io/badge/language-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge"/>
    <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License Badge"/>
    <br>
    <a href="README_RU.md"><img src="https://img.shields.io/badge/Русская%20версия-Читать-blue?style=for-the-badge&labelColor=darkblue" alt="Russian Version Badge"/></a>
</div>

## Overview

<p align="center">
  <img src="Meadow.png" alt="Game">
</p>

Automation script for Discord activities with gameplay helpers for:
1. Repeated action clicking
2. 3x3 triplet matching game flow
3. Arrow sequence game flow
4. Target clicking game flow

The script is designed to run directly from Discord DevTools Console.

## Features

- Automatic interaction with supported game activities
- Looping gameplay with restart/wait handling for cooldown states
- Continue-button handling when rounds end
- Runtime controls (start, stop, status, unload)
- Compatibility aliases for command convenience

## Script File

Use this file:
- [script.js](script.js)

## How to Enable DevTools in Discord Desktop

Use WIN+R to open the Windows Run dialog and open the settings folder for your Discord build:

1. Discord: `%APPDATA%\Discord\`
2. Discord PTB (Public Test Build): `%APPDATA%\DiscordPTB\`
3. Discord Canary: `%APPDATA%\discordcanary\`

Then:

1. Open `settings.json` in that folder.
2. It helps to enable file extensions in Windows Explorer.
3. Use a proper text editor (for example, Notepad++).
4. Add this key:

```json
"DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true
```

Example before:

```json
{
    "BACKGROUND_COLOR": "#202225",
    "IS_MAXIMIZED": false,
    "IS_MINIMIZED": false,
    "WINDOW_BOUNDS": {
        "x": 288,
        "y": 51,
        "width": 1591,
        "height": 919
    },
    "OPEN_ON_STARTUP": false
}
```

Example after:

```json
{
    "BACKGROUND_COLOR": "#202225",
    "IS_MAXIMIZED": false,
    "IS_MINIMIZED": false,
    "WINDOW_BOUNDS": {
        "x": 288,
        "y": 51,
        "width": 1591,
        "height": 919
    },
    "OPEN_ON_STARTUP": false,
    "DANGEROUS_ENABLE_DEVTOOLS_ONLY_ENABLE_IF_YOU_KNOW_WHAT_YOURE_DOING": true
}
```

Important: the comma after `"OPEN_ON_STARTUP": false` is required before adding the new key.

## How to Use

1. Open Discord and enter the game screen.
2. Open DevTools Console.
3. Copy the content of [script.js](script.js).
4. Paste it into Console and press Enter.
5. All modules start automatically.

## Commands

### Global

- window.discordGameBots.startAll()
- window.discordGameBots.stopAll()
- window.discordGameBots.status()
- window.discordGameBots.unload()

### Per Module

- window.discordGameBots.adventure.start()
- window.discordGameBots.triplet.start()
- window.discordGameBots.arrow.start()
- window.discordGameBots.target.start()

### Compatibility Aliases

- window.adventureClicker
- window.tripletGridBot
- window.arrowSequenceBot
- window.targetShooterBot

## ⚠️ Disclaimer

This script is for educational purposes only. Use at your own risk. Automation may violate Discord Terms of Service.

## 📬 Contact

For questions or suggestions, contact me on Telegram: [@mudachyo](https://t.me/mudachyo)

## 📄 License

This project is licensed under MIT. See [LICENSE](LICENSE).
