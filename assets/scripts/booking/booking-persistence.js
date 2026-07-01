/**
 * Booking Persistence Service
 *
 * Saves and restores the booking state to/from localStorage.
 * Handles versioning, 30-day expiry, and all localStorage errors silently
 * so users are never disrupted if storage is unavailable.
 *
 * Exposes a single global: window.BookingPersistence
 */
(function (global) {
    'use strict';

    /** localStorage key used to store the booking snapshot */
    var STORAGE_KEY = 'staywave_booking';

    /**
     * Schema version. Increment this string when the saved booking shape
     * changes in a breaking way so that old snapshots are discarded gracefully.
     */
    var SCHEMA_VERSION = '1.0';

    /** Saved bookings older than this many days are auto-deleted on load */
    var EXPIRY_DAYS = 30;
    var EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    /**
     * Returns true when localStorage is readable and writable.
     * Private-browsing mode or locked-down environments may deny access.
     */
    function isAvailable() {
        try {
            var test = '__sw_ls_test__';
            localStorage.setItem(test, '1');
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Returns true when the ISO-8601 date string is older than EXPIRY_DAYS.
     * Returns true (treat as expired) when the date cannot be parsed.
     */
    function isExpired(savedAt) {
        try {
            var saved = new Date(savedAt).getTime();
            if (isNaN(saved)) {
                return true;
            }
            return (Date.now() - saved) > EXPIRY_MS;
        } catch (e) {
            return true;
        }
    }

    /**
     * Returns true when the saved version string matches the current schema.
     * Future releases may accept a range; for now only exact match is valid.
     */
    function isCompatibleVersion(version) {
        return version === SCHEMA_VERSION;
    }

    /**
     * Saves a booking snapshot to localStorage.
     * The stored envelope is:
     *   { version, savedAt, booking }
     *
     * @param {Object} booking - The booking fields to persist.
     */
    function save(booking) {
        if (!isAvailable()) {
            return;
        }
        try {
            var envelope = {
                version: SCHEMA_VERSION,
                savedAt: new Date().toISOString(),
                booking: booking
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
        } catch (e) {
            /* Non-fatal: quota exceeded or serialisation error */
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[BookingPersistence] save failed:', e.message);
            }
        }
    }

    /**
     * Loads and validates a previously saved booking snapshot.
     *
     * Returns the booking object when found and valid.
     * Returns null and clears stale data when:
     *   - Nothing is saved
     *   - The JSON cannot be parsed
     *   - The version is incompatible
     *   - The snapshot has expired (> 30 days old)
     *   - The booking field is missing or not an object
     */
    function load() {
        if (!isAvailable()) {
            return null;
        }
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                return null;
            }

            var envelope = JSON.parse(raw);

            if (!envelope || typeof envelope !== 'object') {
                clear();
                return null;
            }

            if (!isCompatibleVersion(envelope.version)) {
                /* Incompatible schema — discard silently */
                clear();
                return null;
            }

            if (isExpired(envelope.savedAt)) {
                /* Expired — auto-delete and continue without interruption */
                clear();
                return null;
            }

            if (!envelope.booking || typeof envelope.booking !== 'object') {
                clear();
                return null;
            }

            return envelope.booking;
        } catch (e) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[BookingPersistence] load failed:', e.message);
            }
            return null;
        }
    }

    /**
     * Removes the saved booking snapshot from localStorage.
     */
    function clear() {
        if (!isAvailable()) {
            return;
        }
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[BookingPersistence] clear failed:', e.message);
            }
        }
    }

    /* Public API */
    global.BookingPersistence = {
        save: save,
        load: load,
        clear: clear,
        isAvailable: isAvailable
    };

}(typeof window !== 'undefined' ? window : this));
