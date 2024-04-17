// This is not a pinia store
// I just need a place to store the search injection key

import type { InjectionKey, Ref } from "vue"

export const searchTermKey = Symbol() as InjectionKey<Ref<string>>
