export const NOT_PROVIDED = "Not provided";

export function textOrMissing(value?: string | null): string {
    if (value == null) return NOT_PROVIDED;
    const v = String(value).trim();
    return v.length ? v : NOT_PROVIDED;
}

export function materialsLine(materials?: string[] | null): string {
    if (!materials?.length) return NOT_PROVIDED;
    const joined = materials.map((m) => m.trim()).filter(Boolean).join(", ");
    return joined || NOT_PROVIDED;
}
