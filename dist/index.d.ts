export interface ITranslateConfig {
    translationFileUrl: string;
    errorCallback?: (error: string) => void;
    notify?: boolean;
    notificationEndpoint?: string;
    notificationHeaders?: {
        [key: string]: string;
    };
    cache?: boolean;
    cacheExpirationTime?: number;
    useLocalStorage?: boolean;
    locale?: string;
}
export interface ILocaleTranslation {
    [key: string]: ITranslation;
}
export interface ITranslation {
    [key: string]: string;
}
/**
 * Inits the configuration parameters and fetches the translations
 * @param conf ITranslateConfig configuration for the library
 */
export declare const initTranslations: (conf: ITranslateConfig) => Promise<boolean>;
/**
 * Fetchest translations either from local storage or from remote.
 * Returns true on success, false on error
 */
export declare const fetchTranslations: () => Promise<boolean>;
/**
 * Function for debugging state of translations
 * @param locale Optional locale to only return part of translations
 */
export declare const exportTranslations: (locale?: string | undefined) => ILocaleTranslation | ITranslation | undefined;
/**
 * Translates a given phrase using replacements and a locale
 * @param key phrase to translate
 * @param replacements optional replacements as key/value object
 * @param locale optional locale to use for translations
 */
export declare const t: (key: string, replacements?: {
    [Key: string]: string | number;
} | undefined, context?: string | undefined, locale?: string | undefined) => string;
