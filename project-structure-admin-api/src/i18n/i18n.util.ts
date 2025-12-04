import { I18nService } from 'nestjs-i18n';

const DEFAULT_NS = process.env.I18N_DEFAULT_NS || 'common';

export function translate(
    i18n: I18nService,
    key: string,
    options?: Record<string, unknown>
): string {
    const namespacedKey = key.includes('.') ? key : `${DEFAULT_NS}.${key}`;
    const value = i18n.t(namespacedKey, options as Record<string, unknown>);
    return typeof value === 'string' ? value : String(value);
}
