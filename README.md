# expo-alarm-kit

An Expo module for iOS AlarmKit integration. Schedule native iOS alarms with optional app launch on dismissal or snooze intents.

> **This is a fork of [nickdeupree/expo-alarm-kit](https://github.com/nickdeupree/expo-alarm-kit)**, maintained for the apps that depend on it. It adds two things:
>
> * **Optional pause/resume buttons** on timer alarms, so an app that owns its timer's state can schedule a watch-only countdown. Proposed upstream as [#6](https://github.com/nickdeupree/expo-alarm-kit/pull/6).
> * **`contentColor` in the alarm's metadata**, so a widget extension knows what colour reads on top of `tintColor` instead of guessing from luminance.
>
> It is **not published to npm**. Install it by git ref (see below). Because it tracks only the Expo SDK its consumers run, it is a narrower target than upstream — if you need broader SDK support, use upstream.

> **⚠️ Requirements:**
> * **iOS Deployment Target:** 26.0+
> * **Expo SDK:** 57+
> * **Framework:** Apple AlarmKit

## Features

* 📅 **Schedule Native Alarms:** Create alarms that persist even if the app is killed.
* 🔄 **Repeating Alarms:** Support for weekly repeating schedules.
* 🚀 **App Launch Triggers:** Optionally launch your app when the user dismisses or snoozes the alarm.
* 🧩 **Custom Intent Payloads:** Attach optional payload strings for dismiss/snooze events.
* 🎨 **Customization:** Configure titles, snooze settings, and tint colors.
* 💾 **Shared State:** Uses App Groups to synchronize alarm state between the system and your app.

---

## Installation

This fork is installed by git ref, pinned to a tag or a commit SHA:

```bash
npm install "git+https://github.com/cvburgess/expo-alarm-kit.git#v0.2.0"
```

The package name stays `expo-alarm-kit`, so imports and Expo autolinking are unchanged.

Prefer the `git+https://` form over npm's `github:` shorthand — npm normalizes the
shorthand to `git+ssh://` in the lockfile, which fails on CI runners and EAS build
workers that have no SSH agent.

There is no `prepare` script and no build step at install time: `build/` is committed,
so installing is a clone. See [Contributing](#contributing) if you change the source.

Since this module utilizes native iOS frameworks, you must prebuild your project:

```bash
npx expo prebuild

```

---

## Configuration (Required)

This module requires native iOS configuration to function. **If these steps are skipped, the module will throw errors.**

### 1. Set Deployment Target

In Xcode, navigate to your project's **Build Settings** and ensure the **iOS Deployment Target** is set to **26.0** or higher.

> ❌ **Error:** Failing to do this will result in a "Module not found: ExpoAlarmKit" error.

### 2. Add Usage Description

Apple requires you to justify why you need access to alarms.

1. Open your project in Xcode.
2. Select your app target and go to the **Info** tab.
3. Add a new key: `Privacy - Alarm Kit Usage Description`.
4. Value: Enter a short description (e.g., *"We use alarms to wake you up at your scheduled times."*)

### 3. Configure App Groups

App Groups allow the Alarm extension to communicate with your main application.

1. In Xcode, select your app target.
2. Go to **Signing & Capabilities**.
3. Click **+ Capability** and select **App Groups**.
4. Add a new group identifier (e.g., `group.com.yourcompany.yourapp`).

> **Important:** This identifier must match exactly what you pass to the `configure()` method in your JavaScript code.

---

## Usage

### 1. Initialization

You must configure the module with your App Group ID as early as possible in your app's lifecycle (e.g., inside `App.tsx` or `_layout.tsx`).

```typescript
import { useEffect } from 'react';
import { configure, getLaunchPayload } from 'expo-alarm-kit';

export default function App() {
  useEffect(() => {
    // 1. Initialize the module
    const isConfigured = configure('group.com.yourcompany.yourapp');
    
    if (!isConfigured) {
      console.error('Failed to configure ExpoAlarmKit. Check App Group ID.');
    }

    // 2. Check if app was launched via an alarm dismiss/snooze intent
    const payload = getLaunchPayload();
    if (payload) {
      console.log('App launched by alarm:', payload.alarmId);
      // Navigate to specific screen or perform action
    }
  }, []);

  return <YourAppContent />;
}

```

### 2. Scheduling Alarms

```typescript
import { 
  scheduleAlarm, 
  scheduleRepeatingAlarm,
  scheduleTimerAlarm,
  generateUUID, 
  requestAuthorization 
} from 'expo-alarm-kit';

const handleSchedule = async () => {
  // Always request permission first
  const authStatus = await requestAuthorization();
  if (authStatus !== 'authorized') return;

  // Example: Schedule a one-time alarm for 1 hour from now
  const alarmId = generateUUID();
  
  await scheduleAlarm({
    id: alarmId,
    epochSeconds: Date.now() / 1000 + 3600, 
    title: 'Power Nap Over',
    soundName: 'alarm.wav', // Must be in Xcode bundle resources
    launchAppOnDismiss: true,
    dismissPayload: 'nap-dismiss',
    doSnoozeIntent: true,
    launchAppOnSnooze: true,
    snoozePayload: 'nap-snooze',
    snoozeDuration: 300, // 5 minutes
  });
};

const handleRepeatingSchedule = async () => {
  // Example: Schedule for Mon-Fri at 7:30 AM
  const id = generateUUID();
  
  await scheduleRepeatingAlarm({
    id,
    hour: 7,
    minute: 30,
    weekdays: [2, 3, 4, 5, 6], // 1=Sun, 2=Mon...
    title: 'Work Alarm',
    launchAppOnDismiss: true,
    dismissPayload: 'work-dismiss',
    doSnoozeIntent: true,
    launchAppOnSnooze: false,
    snoozePayload: 'work-snooze',
  });
};

const handleTimerSchedule = async () => {
  // Example: Schedule a timer alarm for 30 minutes from now
  const authStatus = await requestAuthorization();
  if (authStatus !== 'authorized') return;

  const timerId = generateUUID();
  
  await scheduleTimerAlarm({
    id: timerId,
    duration: 1800, // 30 minutes
    title: 'Pomodoro Complete',
    soundName: 'alarm.wav',
    launchAppOnDismiss: true,
    dismissPayload: 'pomodoro-done',
  });
};

```

### 3. Managing Alarms

```typescript
import { cancelAlarm, getAllAlarms } from 'expo-alarm-kit';

// Get list of active alarm IDs
const activeAlarms = getAllAlarms();

// Cancel a specific alarm
await cancelAlarm('your-alarm-uuid');

```

---

## How It Works

### App Groups & Shared Storage

This module relies on **iOS App Groups** to share `UserDefaults` between the main app process and the system alarm extension.

* **Persistence:** When you schedule an alarm, the metadata is written to this shared storage.
* **Sync:** Both the Native Module and the App Extension read from this same source of truth.

### App Launch on Dismiss/Snooze

When `launchAppOnDismiss: true` or (`doSnoozeIntent: true` + `launchAppOnSnooze: true`) is set:

1. The user dismisses or snoozes the alarm on the lock screen.
2. The system launches your app in the background/foreground.
3. The module writes a `LaunchPayload` to the shared storage.
4. When your React Native JS bundle loads, calling `getLaunchPayload()` retrieves and clears this data, allowing you to react to the event.

### Widget Extensions & Alarm Metadata

If you ship your own widget extension to draw the lock-screen card, it receives
`AlarmAttributes<Meta>`. Two rules govern the `Meta` type, and neither produces a
compile error when broken — the symptom is a lock screen that renders nothing:

1. **The type must be named exactly `Meta`.** ActivityKit matches your widget's
   type against the scheduled activity's on the *unqualified* name;
   `String(describing:)` erases the module and any enclosing context. Your mirror
   lives in a different module than this one and still matches, but only while
   both are spelled `Meta`.
2. **Every property must be `Optional`.** Swift synthesises `decodeIfPresent` for
   Optional stored properties, which is what lets your widget decode metadata
   written by a build that predates the field. A non-Optional property with a
   default value does *not* get that treatment — synthesised `Decodable` ignores
   the default and throws on missing data.

The minimal mirror, which reads `contentColor` and tolerates its absence:

```swift
@available(iOS 26.0, *)
nonisolated struct Meta: AlarmMetadata {
    let contentColor: String?
}
```

A widget whose `Meta` is still empty (`struct Meta: AlarmMetadata {}`) keeps
working against this version — keyed decoders ignore unknown keys — so you can
adopt `contentColor` whenever you're ready rather than in lockstep.

---

## API Reference

### Configuration & Auth

#### `configure(appGroupIdentifier: string): boolean`

Initializes the module. **Must be called before other methods.**

* **Returns:** `true` if the App Group was accessible.

#### `requestAuthorization(): Promise<AuthorizationStatus>`

Prompts the user for permission to schedule alarms.

* **Returns:** `'authorized' | 'denied' | 'notDetermined'`

---

### Scheduling

#### `scheduleAlarm(options): Promise<boolean>`

Schedules a non-repeating alarm.

**Options Object:**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | **Yes** | Unique UUID. |
| `epochSeconds` | `number` | No* | Unix timestamp (seconds) for the alarm. |
| `date` | `Date` | No* | *Alternative:* JS Date object. |
| `title` | `string` | **Yes** | Main text displayed on lock screen. |
| `soundName` | `string` | No | Filename of sound in app bundle. |
| `launchAppOnDismiss` | `boolean` | No | If `true`, opens app when stopped. |
| `dismissPayload` | `string` | No | Optional payload string for dismiss intent (`null` in payload if omitted). |
| `doSnoozeIntent` | `boolean` | No | If `true`, enables custom snooze intent (default: `false`). |
| `launchAppOnSnooze` | `boolean` | No | If `true`, opens app when snooze intent runs. |
| `snoozePayload` | `string` | No | Optional payload string for snooze intent (`null` in payload if omitted). |
| `stopButtonLabel` | `string` | No | Text for stop button (default: 'Stop'). |
| `snoozeButtonLabel` | `string` | No | Text for snooze button. |
| `stopButtonColor` | `string` | No | Hex color string. |
| `snoozeButtonColor` | `string` | No | Hex color string. |
| `tintColor` | `string` | No | Overall UI tint color. |
| `contentColor` | `string` | No | Hex color that reads on top of `tintColor`, for a widget extension. |
| `snoozeDuration` | `number` | No | Duration in seconds (default: 540). |

**Note: Provide either `epochSeconds` OR `date`, not both.*

#### `scheduleRepeatingAlarm(options): Promise<boolean>`

Schedules a weekly repeating alarm.

**Options Object:**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | **Yes** | Unique UUID. |
| `hour` | `number` | **Yes** | 0-23 |
| `minute` | `number` | **Yes** | 0-59 |
| `weekdays` | `number[]` | **Yes** | Array of integers: 1 (Sun) to 7 (Sat). |
| `title` | `string` | **Yes** | Main text displayed. |
| `launchAppOnDismiss` | `boolean` | No | If `true`, opens app when stopped. |
| `dismissPayload` | `string` | No | Optional payload string for dismiss intent (`null` in payload if omitted). |
| `doSnoozeIntent` | `boolean` | No | If `true`, enables custom snooze intent (default: `false`). |
| `launchAppOnSnooze` | `boolean` | No | If `true`, opens app when snooze intent runs. |
| `snoozePayload` | `string` | No | Optional payload string for snooze intent (`null` in payload if omitted). |
| ... | ... | ... | *Supports all visual options from `scheduleAlarm`.* |

#### `scheduleTimerAlarm(options): Promise<boolean>`

Schedules a timer-based alarm that fires after a specified duration.

**Options Object:**

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | `string` | **Yes** | Unique UUID. |
| `duration` | `number` | **Yes** | Duration in seconds (minimum 60). |
| `title` | `string` | **Yes** | Main text displayed on lock screen. |
| `soundName` | `string` | No | Filename of sound in app bundle. |
| `tintColor` | `string` | No | Hex color string (default: '#0000FF'). |
| `contentColor` | `string` | No | Hex color that reads on top of `tintColor`, for a widget extension. |
| `pauseButtonLabel` | `string` | No | Text for pause button. Omit for a countdown with no pause button. |
| `pauseButtonColor` | `string` | No | Hex color string for pause button. |
| `resumeButtonLabel` | `string` | No | Text for resume button. Omit for no paused presentation. |
| `resumeButtonColor` | `string` | No | Hex color string for resume button. |

> **Watch-only countdowns:** omit `pauseButtonLabel` and `resumeButtonLabel` to
> get a countdown the user can see but not control. AlarmKit will happily draw a
> Pause button, but nothing reports the press back to your app —
> `AlarmManager.shared.alarms` carries a paused alarm's `state` and never its
> elapsed time. If your app owns the timer's state, a lock-screen pause it cannot
> observe puts the two out of sync, so the safe configuration is no button.
| `launchAppOnDismiss` | `boolean` | No | If `true`, opens app when stopped. |
| `dismissPayload` | `string` | No | Optional payload string for dismiss intent. |



---

### Utilities

#### `cancelAlarm(id: string): Promise<boolean>`

Cancels the alarm in AlarmKit and removes it from shared storage.

#### `generateUUID(): string`

Helper to generate a unique ID string for new alarms.

#### `getAllAlarms(): string[]`

Returns an array of IDs for all currently scheduled alarms.

#### `getLaunchPayload(): LaunchPayload | null`

Returns data if the app was launched via an alarm.

```typescript
interface LaunchPayload {
  alarmId: string;
  payload: string | null;
}

```

#### `removeAlarm(id: string): void`

*Advanced:* Removes an alarm from local storage records without cancelling the native AlarmKit instance. Use `cancelAlarm` for standard usage.

---

## Known Issues

* **Custom Labels/Colors:** The `stopButtonLabel`, `stopButtonColor` properties are not correctly modifying the stop button/slider.

---

## Contributing

```bash
npm ci
npm run build   # tsc -> build/
```

**`build/` is committed, and you must commit it with your source change.** There is
no `prepare` script, so nothing compiles at install time — a consumer installing by
git ref gets whatever is in `build/` at that ref. Source without a matching build is
a change that silently does not ship. CI enforces this (`.github/workflows/build-is-current.yml`).

Two other things that bite:

* **`ios/ExpoAlarmKit.podspec` enumerates `s.source_files`.** A new `.swift` file is
  not compiled until it is listed there, and the failure looks like a missing type
  rather than a missing file.
* **The metadata struct must stay named `Meta` with only Optional properties.** See
  [Widget Extensions & Alarm Metadata](#widget-extensions--alarm-metadata) — breaking
  either rule produces no compile error, just a lock screen that renders nothing.

This fork tracks only the Expo SDK its consumers run. Changes that are generally
useful rather than consumer-specific should go upstream to
[nickdeupree/expo-alarm-kit](https://github.com/nickdeupree/expo-alarm-kit) first,
branched off *upstream* `main` so the diff stays clean.
