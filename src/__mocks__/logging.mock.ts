import { jest } from "@jest/globals";

jest.mock("@/services/logging", () => ({
    logger: {
        child: jest.fn().mockReturnThis(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        error: jest.fn(),
    },
}));
