export class Cache {
    private static instance: Cache;
    private cache: Map<string, any>;

    private constructor() {
        this.cache = new Map<string, any>();
    }

    public static getInstance(): Cache {
        if (!Cache.instance) {
            Cache.instance = new Cache();
        }
        return Cache.instance;
    }

    public set(key: string, value: any): void {
        this.cache.set(key, value);
    }

    public get(key: string): any {
        return this.cache.get(key);
    }

    public delete(key: string): boolean {
        return this.cache.delete(key);
    }

    public clear(): void {
        this.cache.clear();
    }

    public has(key: string): boolean {
        return this.cache.has(key);
    }
}