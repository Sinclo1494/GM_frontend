/// <reference types="vitest/globals" />

import { vi } from "vitest";

export { mockNavigate, mockAxios, localStorageMock } from "../setupTests";

export const resetAllMocks = () => {
  vi.clearAllMocks();
};
