function requiredEnvironmentVariable(name: string): string {
    const value = process.env?.[name];

    if (!value) throw new Error(`Missing required environment variable: ${name}`);

    return value;
}

export function getDatabaseUrl(): string {
    const user = encodeURIComponent(requiredEnvironmentVariable("POSTGRES_USER"));
    const password = encodeURIComponent(requiredEnvironmentVariable("POSTGRES_PASSWORD"));
    const database = encodeURIComponent(requiredEnvironmentVariable("POSTGRES_DB"));

    const host = process.env.POSTGRES_HOST ?? "localhost";
    const port = process.env.POSTGRES_PORT ?? "5432";

    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
