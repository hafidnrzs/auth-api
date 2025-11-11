import { describe, it, expect } from "@jest/globals";
import AuthenticationTokenManager from "../AuthenticationTokenManager.js";

describe("AuthenticationTokenManager interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const tokenManager = new AuthenticationTokenManager();

    // Action and Assert
    await expect(tokenManager.createAccessToken("")).rejects.toThrow(
      "AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
    await expect(tokenManager.createRefreshToken("")).rejects.toThrow(
      "AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
    await expect(tokenManager.verifyRefreshToken("")).rejects.toThrow(
      "AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
    await expect(tokenManager.decodePayload("")).rejects.toThrow(
      "AUTHENTICATION_TOKEN_MANAGER.METHOD_NOT_IMPLEMENTED"
    );
  });
});
