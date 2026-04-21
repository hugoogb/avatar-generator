/**
 * Validates that a user-supplied option value is one of the accepted values
 * for a style. Designed for options typed as string literal unions (e.g.
 * `FacesHairStyle`) where a TypeScript-only caller cannot pass an invalid
 * value but a JavaScript caller (or a string-assembled config) can.
 *
 * Does nothing when `value` is `undefined` — styles treat absence as "pick
 * randomly," and picking randomly is always valid.
 *
 * @param styleName - Style identifier, included in the error for context
 * @param optionName - Property name on the options object (e.g. "hairStyle")
 * @param value - The value the user passed
 * @param validValues - All accepted values for the option
 * @throws Error with the invalid value and the list of valid values
 *
 * @example
 * ```ts
 * validateOption("faces", "hairStyle", options.hairStyle, HAIR_STYLES);
 * ```
 */
export function validateOption<T extends string>(
    styleName: string,
    optionName: string,
    value: T | undefined,
    validValues: readonly T[],
): void {
    if (value === undefined) return;
    if (!validValues.includes(value)) {
        const valid = validValues.map((v) => JSON.stringify(v)).join(", ");
        throw new Error(
            `[@avatar-generator/style-${styleName}] Invalid ${optionName}: ${JSON.stringify(value)}. ` +
                `Expected one of: ${valid}.`,
        );
    }
}
