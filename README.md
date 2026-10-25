# WeatherMe 🌤️

A polished Expo + React Native weather app with NativeWind (Tailwind CSS), live current conditions, a 7-day forecast, saved locations, and English/French/Arabic language switching.

## Run it locally (no hosting needed)
1. Install Node.js LTS on your computer.
2. Unzip this project and open a terminal in the `WeatherMe` folder.
3. Run `npm install`
4. Run `npx expo start`
5. Install **Expo Go** on your Android phone, then scan the QR code shown in the terminal/browser. Your phone and computer should be on the same Wi-Fi network.
6. For a web preview on your computer, run `npx expo start --web`.

No weather API key is required. Weather and geocoding are provided by Open-Meteo:
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`

## Features
- Search cities, countries/regions returned by geocoding
- Current temperature, apparent temperature, conditions, humidity, wind and UV index
- 7-day high/low and precipitation probability
- Bookmark multiple places and remove saved places
- English, French and Arabic labels
- Morning/day, afternoon/evening and night gradient themes
- NativeWind/Tailwind styling and Expo vector icons

## Notes
- Saved locations are held in app state for this starter version; install `@react-native-async-storage/async-storage` to persist them across app restarts.
- The Arabic labels are translated and the UI can be switched to Arabic. Full RTL layout can be enabled with `I18nManager` plus an app reload if you want every layout element mirrored.
- The background theme currently follows local device time; once weather is loaded it uses Open-Meteo's `is_day` value to distinguish day/night. The evening palette is warm sunset-inspired.
- This is a source project, not a hosted store release. No hosting or backend is required.


## Creator footer
The app footer displays:
- Created by **Hichem Bendali**
- Email: **hichembendali08@gmail.com**
- `© [current year] Hichem Bendali. All rights reserved.`

## Technologies used
- **Programming languages:** TypeScript (React Native screen source), JavaScript (Expo/Babel/Metro/Tailwind configuration), CSS (Tailwind entry stylesheet), HTML/CSS/JavaScript (standalone browser preview). **Python is not used by this project.**
- **Frameworks/platforms:** React Native, React, Expo, Expo Router.
- **Styling:** NativeWind and Tailwind CSS.
- **UI and device libraries:** `@expo/vector-icons`, `expo-linear-gradient`, `expo-status-bar`, `react-native-safe-area-context`, `react-native-screens`, `react-native-svg`, `react-native-reanimated`.
- **Web preview dependencies:** React DOM and React Native Web.
- **Language tooling:** TypeScript and `@types/react`.
- **Build/configuration tools:** Babel (`babel-preset-expo`), Metro (`expo/metro-config`, `nativewind/metro`), Expo CLI.
- **APIs:** Open-Meteo Geocoding API (search places) and Open-Meteo Forecast API (current conditions and 7-day forecast).
- **Web APIs / data handling:** Fetch API for HTTP requests and JSON parsing via `response.json()`. No API key is required for the Open-Meteo endpoints used here.
