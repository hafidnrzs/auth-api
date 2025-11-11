import { describe, it, expect, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import BcryptPasswordHash from "../BcryptPasswordHash.js";
import AuthenticationError from "../../../Commons/exceptions/AuthenticationError.js";

describe("BcryptPasswordHash", () => {
  describe("hash function", () => {
    it("should encrypt password correctly", async () => {
      // Arrange
      const spyHash = jest.spyOn(bcrypt, "hash");
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      // Action
      const encryptedPassword = await bcryptPasswordHash.hash("plain_password");

      // Assert
      expect(typeof encryptedPassword).toEqual("string");
      expect(encryptedPassword).not.toEqual("plain_password");
      expect(spyHash).toHaveBeenCalledWith("plain_password", 10);
    });
  });

  describe("comparePassword function", () => {
    it("should throw AuthenticationError if password not match", async () => {
      // Arrange
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);

      // Action & Assert
      await expect(
        bcryptPasswordHash.comparePassword(
          "plain_password",
          "encrypted_password"
        )
      ).rejects.toThrow(AuthenticationError);
    });

    it("should not return AuthenticationError if password match", async () => {
      // Arrange
      const bcryptPasswordHash = new BcryptPasswordHash(bcrypt);
      const plainPassword = "secret";
      const encryptedPassword = await bcryptPasswordHash.hash(plainPassword);

      // Action & Assert
      await expect(
        bcryptPasswordHash.comparePassword(plainPassword, encryptedPassword)
      ).resolves.not.toThrow(AuthenticationError);
    });
  });
});
