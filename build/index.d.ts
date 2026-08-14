import type { AuthorizationStatus, LaunchPayload } from './ExpoAlarmKitModule';
export type { AuthorizationStatus, LaunchPayload };
/**
 * Configure the module with an App Group identifier.
 * This MUST be called before any other methods to enable shared storage
 * between your app and the alarm dismiss intent.
 *
 * @param appGroupIdentifier - The App Group identifier (e.g., "group.com.yourapp.alarms")
 * @returns True if configuration succeeded.
 *
 * @example
 * ```typescript
 * import { configure } from 'expo-alarm-kit';
 *
 * // Call this early in your app initialization
 * const success = configure('group.com.yourcompany.yourapp');
 * if (!success) {
 *   console.error('Failed to configure ExpoAlarmKit');
 * }
 * ```
 */
export declare function configure(appGroupIdentifier: string): boolean;
/**
 * Request authorization to schedule alarms.
 * On first call, this will prompt the user for permission.
 * @returns The current authorization status.
 */
export declare function requestAuthorization(): Promise<AuthorizationStatus>;
/**
 * Generate a valid UUID string for use as an alarm ID.
 * Call this before scheduling an alarm to get a unique identifier.
 * @returns A new UUID string.
 */
export declare function generateUUID(): string;
export interface ScheduleAlarmOptions {
    /** Unique identifier for the alarm */
    id: string;
    /** Unix timestamp in seconds for when the alarm should fire. Provide either this or date. */
    epochSeconds?: number;
    /** JavaScript Date object for when the alarm should fire. Provide either this or epochSeconds. */
    date?: Date;
    /** Title displayed for the alarm */
    title: string;
    /** Optional custom sound name (must exist in app bundle) */
    soundName?: string;
    /** Whether to launch the app when the alarm stop button is pressed. Defaults to false. */
    launchAppOnDismiss?: boolean;
    /** Whether to run a custom snooze intent when the snooze button is pressed. Defaults to false. */
    doSnoozeIntent?: boolean;
    /** Whether to launch the app when the custom snooze intent runs. Defaults to false. */
    launchAppOnSnooze?: boolean;
    /** Optional payload string returned by getLaunchPayload when dismissed. Defaults to null. */
    dismissPayload?: string;
    /** Optional payload string returned by getLaunchPayload when snoozed. Defaults to null. */
    snoozePayload?: string;
    /** Custom label for the stop button (default: 'Stop') */
    stopButtonLabel?: string;
    /** Custom label for the snooze button (default: 'Snooze') */
    snoozeButtonLabel?: string;
    /** Hex color for the stop button text (default: '#FFFFFF') */
    stopButtonColor?: string;
    /** Hex color for the snooze button text (default: '#FFFFFF') */
    snoozeButtonColor?: string;
    /** Hex color for the overall alarm tint (default: '#0000FF') */
    tintColor?: string;
    /**
     * Hex color that reads on top of `tintColor`. Not drawn by AlarmKit
     * itself — it travels in the alarm's metadata for a widget extension to
     * use when it draws its own content over the tint. Omit it and a widget
     * has only the tint to work from.
     */
    contentColor?: string;
    /** Snooze duration in seconds (default: 540 = 9 minutes) */
    snoozeDuration?: number;
}
/**
 * Schedule a one-time alarm.
 * @param options - Alarm configuration options. Provide either epochSeconds or date.
 * @returns True if the alarm was scheduled successfully.
 */
export declare function scheduleAlarm(options: ScheduleAlarmOptions): Promise<boolean>;
export interface ScheduleRepeatingAlarmOptions {
    /** Unique identifier for the alarm */
    id: string;
    /** Hour (0-23) for the alarm */
    hour: number;
    /** Minute (0-59) for the alarm */
    minute: number;
    /** Array of weekday numbers: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday */
    weekdays: number[];
    /** Title displayed for the alarm */
    title: string;
    /** Optional custom sound name (must exist in app bundle) */
    soundName?: string;
    /** Whether to launch the app when the alarm stop button is pressed. Defaults to false. */
    launchAppOnDismiss?: boolean;
    /** Whether to run a custom snooze intent when the snooze button is pressed. Defaults to false. */
    doSnoozeIntent?: boolean;
    /** Whether to launch the app when the custom snooze intent runs. Defaults to false. */
    launchAppOnSnooze?: boolean;
    /** Optional payload string returned by getLaunchPayload when dismissed. Defaults to null. */
    dismissPayload?: string;
    /** Optional payload string returned by getLaunchPayload when snoozed. Defaults to null. */
    snoozePayload?: string;
    /** Custom label for the stop button (default: 'Stop') */
    stopButtonLabel?: string;
    /** Custom label for the snooze button (default: 'Snooze') */
    snoozeButtonLabel?: string;
    /** Hex color for the stop button text (default: '#FFFFFF') */
    stopButtonColor?: string;
    /** Hex color for the snooze button text (default: '#FFFFFF') */
    snoozeButtonColor?: string;
    /** Hex color for the overall alarm tint (default: '#0000FF') */
    tintColor?: string;
    /**
     * Hex color that reads on top of `tintColor`. Not drawn by AlarmKit
     * itself — it travels in the alarm's metadata for a widget extension to
     * use when it draws its own content over the tint. Omit it and a widget
     * has only the tint to work from.
     */
    contentColor?: string;
    /** Snooze duration in seconds (default: 540 = 9 minutes) */
    snoozeDuration?: number;
}
/**
 * Schedule a weekly repeating alarm.
 * @param options - Alarm configuration options.
 * @returns True if the alarm was scheduled successfully.
 */
export declare function scheduleRepeatingAlarm(options: ScheduleRepeatingAlarmOptions): Promise<boolean>;
export interface ScheduleTimerOptions {
    /** Unique identifier for the timer alarm */
    id: string;
    /** Duration in seconds (minimum 60 seconds) */
    duration: number;
    /** Title displayed for the alarm when it fires */
    title: string;
    /** Optional custom sound name (must exist in app bundle) */
    soundName?: string;
    /** Hex color for the overall alarm tint (default: '#0000FF') */
    tintColor?: string;
    /**
     * Hex color that reads on top of `tintColor`. Not drawn by AlarmKit
     * itself — it travels in the alarm's metadata for a widget extension to
     * use when it draws its own content over the tint. Omit it and a widget
     * has only the tint to work from.
     */
    contentColor?: string;
    /**
     * Label for the pause button. Omit it to schedule a countdown with no pause
     * button at all — the right choice for an app that owns the timer's state
     * itself, since AlarmKit reports a paused alarm's `state` but never its
     * elapsed time.
     */
    pauseButtonLabel?: string;
    /** Hex color for the pause button text (default: '#0000FF') */
    pauseButtonColor?: string;
    /**
     * Label for the resume button. Omit it to schedule no paused presentation at
     * all; `AlarmPresentation.Paused.resumeButton` is not optional, so there is no
     * "paused, but no button" state to reach.
     */
    resumeButtonLabel?: string;
    /** Hex color for the resume button text (default: '#0000FF') */
    resumeButtonColor?: string;
    /** Whether to launch the app when the alarm stop button is pressed. Defaults to false. */
    launchAppOnDismiss?: boolean;
    /** Optional payload string returned by getLaunchPayload when dismissed. Defaults to null. */
    dismissPayload?: string;
}
/**
 * Schedule a timer-based alarm.
 * @param options - Timer alarm configuration options. Duration must be at least 60 seconds.
 * @returns True if the alarm was scheduled successfully.
 */
export declare function scheduleTimerAlarm(options: ScheduleTimerOptions): Promise<boolean>;
/**
 * Cancel a scheduled alarm.
 * This removes the alarm from both AlarmKit and App Group storage.
 * @param id - The alarm ID to cancel.
 * @returns True if the alarm was cancelled successfully.
 */
export declare function cancelAlarm(id: string): Promise<boolean>;
/**
 * Get all currently scheduled alarm IDs.
 * @returns Array of alarm IDs.
 */
export declare function getAllAlarms(): string[];
export declare function clearAllAlarms(): void;
/**
 * Remove an alarm from App Group storage.
 * Note: This does NOT cancel the native alarm. Use cancelAlarm() to fully cancel an alarm.
 * @param id - The alarm ID to remove from storage.
 */
export declare function removeAlarm(id: string): void;
/**
 * Get the launch payload if the app was opened from an alarm dismiss/snooze intent.
 * The payload contains the alarmId and payload string (or null if not provided).
 * Note: The payload is cleared after retrieval, so subsequent calls will return null.
 * @returns The launch payload or null if not launched from an alarm.
 */
export declare function getLaunchPayload(): LaunchPayload | null;
declare const ExpoAlarmKit: {
    configure: typeof configure;
    requestAuthorization: typeof requestAuthorization;
    generateUUID: typeof generateUUID;
    scheduleAlarm: typeof scheduleAlarm;
    scheduleRepeatingAlarm: typeof scheduleRepeatingAlarm;
    scheduleTimerAlarm: typeof scheduleTimerAlarm;
    cancelAlarm: typeof cancelAlarm;
    getAllAlarms: typeof getAllAlarms;
    clearAllAlarms: typeof clearAllAlarms;
    removeAlarm: typeof removeAlarm;
    getLaunchPayload: typeof getLaunchPayload;
};
export default ExpoAlarmKit;
//# sourceMappingURL=index.d.ts.map