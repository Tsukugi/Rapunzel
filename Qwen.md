# Qwen Project Context

This file provides context for the Qwen Code system about the Rapunzel project.

## Project Overview

Rapunzel is a React Native 0.72 application for reading and downloading books/manga from multiple Lilith repositories including NHentai, HenTag, MangaDex, and EHentai. The application uses a drawer-based navigation system and includes features such as a feed, browse, library, reader, settings, and a built-in webview.

## Key Components

- **State Management**: Uses Taihou (`@atsu/taihou`) for global state and effects
- **Content APIs**: Powered by Lilith packages
- **Persistence**: MMKV for data storage
- **Caching**: Custom cache system for image downloads

## Architecture Details

For detailed information about the project architecture, entry points, data caching, UI components, and development instructions, please refer to the [agents documentation](./agents/AGENTS.md).

## Development

- Install: `npm i` (Node >=16)
- Development: `npm run start` (Metro), then `npm run android` or `npm run ios`
- Tests: `npm test` (Jest), lint: `npm run lint`

For comprehensive documentation about the agent architecture and implementation details, see [AGENTS.md](./agents/AGENTS.md).