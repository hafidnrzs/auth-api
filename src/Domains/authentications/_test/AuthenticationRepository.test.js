import { describe, it, expect } from "@jest/globals";
import AuthenticationRepository from "../AuthenticationRepository.js";

describe("AuthenticationRepository interface", () => {
  it("should throw error when invoke abstract behavior", async () => {
    // Arrange
    const authenticationRepository = new AuthenticationRepository();

    // Action and assert
    await expect(authenticationRepository.addToken("")).rejects.toThrow(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
    await expect(
      authenticationRepository.checkAvailabilityToken("")
    ).rejects.toThrow("AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED");
    await expect(authenticationRepository.deleteToken("")).rejects.toThrow(
      "AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED"
    );
  });
});
