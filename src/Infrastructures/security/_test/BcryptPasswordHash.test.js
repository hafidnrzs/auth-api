import { describe, it, expect, jest } from "@jest/globals";
import bcrypt from "bcrypt";
import BcryptPasswordHash from "../BcryptPasswordHash.js";

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
});
