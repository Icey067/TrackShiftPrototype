import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Ensure environment variables are loaded
dotenv.config();

export interface KeyHealthStats {
  keyId: string;
  maskedKey: string;
  totalCalls: number;
  successCount: number;
  failureCount: number;
  lastUsedAt?: string;
  status: 'HEALTHY' | 'COOLDOWN' | 'ERROR';
  cooldownUntil?: number;
  lastError?: string;
}

class GeminiKeyRotator {
  private keys: { id: string; key: string }[] = [];
  private currentIndex: number = 0;
  private stats: Map<string, KeyHealthStats> = new Map();
  private clients: Map<string, GoogleGenAI> = new Map();
  private readonly COOLDOWN_MS = 60_000; // 1 minute cooldown on 429 rate limit

  constructor() {
    this.reloadKeys();
  }

  /**
   * Reload and discover all configured Gemini API keys from environment
   */
  public reloadKeys(): void {
    const rawKeys: { id: string; key: string }[] = [];

    // 1. Check for numbered keys: GEMINI_API_KEY1, GEMINI_API_KEY2, GEMINI_API_KEY3...
    for (let i = 1; i <= 20; i++) {
      const val = process.env[`GEMINI_API_KEY${i}`] || process.env[`GEMINI_API_KEY_${i}`];
      if (val && val.trim() && !val.includes('MY_GEMINI_API_KEY')) {
        rawKeys.push({ id: `GEMINI_API_KEY${i}`, key: val.trim() });
      }
    }

    // 2. Check comma-separated list
    if (process.env.GEMINI_API_KEYS) {
      const splitKeys = process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean);
      splitKeys.forEach((key, idx) => {
        if (!rawKeys.some(k => k.key === key)) {
          rawKeys.push({ id: `GEMINI_CSV_KEY_${idx + 1}`, key });
        }
      });
    }

    // 3. Check standalone GEMINI_API_KEY
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() && !process.env.GEMINI_API_KEY.includes('MY_GEMINI_API_KEY')) {
      const stdKey = process.env.GEMINI_API_KEY.trim();
      if (!rawKeys.some(k => k.key === stdKey)) {
        rawKeys.push({ id: 'GEMINI_API_KEY', key: stdKey });
      }
    }

    this.keys = rawKeys;

    // Initialize stats & clients
    this.keys.forEach((k) => {
      if (!this.stats.has(k.id)) {
        this.stats.set(k.id, {
          keyId: k.id,
          maskedKey: this.maskKey(k.key),
          totalCalls: 0,
          successCount: 0,
          failureCount: 0,
          status: 'HEALTHY',
        });
      }
      if (!this.clients.has(k.key)) {
        this.clients.set(k.key, new GoogleGenAI({ apiKey: k.key }));
      }
    });

    console.log(`[GeminiKeyRotator] Initialized with ${this.keys.length} API key(s) in round-robin pool.`);
  }

  private maskKey(key: string): string {
    if (key.length <= 10) return '***';
    return `${key.slice(0, 8)}...${key.slice(-6)}`;
  }

  /**
   * Returns the count of configured keys
   */
  public getKeyCount(): number {
    return this.keys.length;
  }

  /**
   * Get the next available round-robin key and its client with failover consideration
   */
  public getNextKey(): { id: string; key: string; client: GoogleGenAI; index: number } | null {
    if (this.keys.length === 0) {
      this.reloadKeys();
      if (this.keys.length === 0) return null;
    }

    const now = Date.now();
    const total = this.keys.length;

    // Try finding a healthy key starting from current round-robin index
    for (let attempt = 0; attempt < total; attempt++) {
      const idx = (this.currentIndex + attempt) % total;
      const candidate = this.keys[idx];
      const stat = this.stats.get(candidate.id);

      // Check if in cooldown
      if (stat && stat.status === 'COOLDOWN' && stat.cooldownUntil && now < stat.cooldownUntil) {
        continue; // Still cooling down, skip
      }

      // Reset cooldown if expired
      if (stat && stat.status === 'COOLDOWN' && stat.cooldownUntil && now >= stat.cooldownUntil) {
        stat.status = 'HEALTHY';
        stat.cooldownUntil = undefined;
      }

      // Advance pointer for next call
      this.currentIndex = (idx + 1) % total;

      const client = this.clients.get(candidate.key) || new GoogleGenAI({ apiKey: candidate.key });
      return {
        id: candidate.id,
        key: candidate.key,
        client,
        index: idx,
      };
    }

    // If all keys are in cooldown, pick the next round-robin anyway as fallback
    const fallbackIdx = this.currentIndex % total;
    this.currentIndex = (this.currentIndex + 1) % total;
    const fallback = this.keys[fallbackIdx];
    return {
      id: fallback.id,
      key: fallback.key,
      client: this.clients.get(fallback.key) || new GoogleGenAI({ apiKey: fallback.key }),
      index: fallbackIdx,
    };
  }

  /**
   * Execute an operation with automatic Round-Robin and fallback retry across all available keys
   */
  public async executeWithRoundRobin<T>(
    operation: (client: GoogleGenAI, keyInfo: { id: string; key: string; index: number }) => Promise<T>
  ): Promise<T> {
    if (this.keys.length === 0) {
      throw new Error('No Gemini API keys configured in environment (GEMINI_API_KEY1, GEMINI_API_KEY2, GEMINI_API_KEY3).');
    }

    const totalKeys = this.keys.length;
    let lastError: any = null;

    // Try up to totalKeys times across the round-robin pool
    for (let attempt = 0; attempt < totalKeys; attempt++) {
      const selected = this.getNextKey();
      if (!selected) break;

      const stat = this.stats.get(selected.id);
      if (stat) {
        stat.totalCalls++;
        stat.lastUsedAt = new Date().toISOString();
      }

      try {
        console.log(`[GeminiKeyRotator] Dispatching request with ${selected.id} (Slot ${selected.index + 1}/${totalKeys})`);
        const result = await operation(selected.client, selected);

        if (stat) {
          stat.successCount++;
          stat.status = 'HEALTHY';
        }
        return result;
      } catch (err: any) {
        lastError = err;
        const errMessage = err?.message || String(err);
        const isRateLimit = errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED') || errMessage.includes('Quota');

        console.warn(`[GeminiKeyRotator] Key ${selected.id} failed: ${errMessage}. Attempt ${attempt + 1}/${totalKeys}`);

        if (stat) {
          stat.failureCount++;
          stat.lastError = errMessage;
          if (isRateLimit) {
            stat.status = 'COOLDOWN';
            stat.cooldownUntil = Date.now() + this.COOLDOWN_MS;
          } else {
            stat.status = 'ERROR';
          }
        }

        // If not the last attempt, continue loop to try next key in the pool
      }
    }

    throw new Error(`All ${totalKeys} Gemini API keys failed in Round-Robin cycle. Last error: ${lastError?.message || lastError}`);
  }

  /**
   * Helper to generate text content using Gemini with automatic key rotation
   */
  public async generateContent(
    prompt: string,
    options: {
      model?: string;
      systemInstruction?: string;
      temperature?: number;
      maxOutputTokens?: number;
    } = {}
  ): Promise<{ text: string; keyUsed: string; model: string }> {
    const modelName = options.model || process.env.GEMINI_MODEL || 'gemini-3.7-flash';

    return this.executeWithRoundRobin(async (client, keyInfo) => {
      const response = await client.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.maxOutputTokens ?? 1024,
        },
      });

      return {
        text: response.text || '',
        keyUsed: keyInfo.id,
        model: modelName,
      };
    });
  }

  /**
   * Retrieve current health metrics and status of the round-robin key pool
   */
  public getStatus(): {
    totalKeys: number;
    currentIndex: number;
    keys: KeyHealthStats[];
  } {
    return {
      totalKeys: this.keys.length,
      currentIndex: this.currentIndex,
      keys: Array.from(this.stats.values()),
    };
  }
}

// Export singleton instance
export const geminiRotator = new GeminiKeyRotator();
export default geminiRotator;
