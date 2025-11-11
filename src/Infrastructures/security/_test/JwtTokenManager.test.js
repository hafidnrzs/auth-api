import { describe, it, expect, jest } from "@jest/globals";
import JwtTokenManager from "../JwtTokenManager.js";
import InvariantError from "../../../Commons/exceptions/InvariantError.js";
import Jwt from "@hapi/jwt";

describe("JwtTokenManager", () => {
  describe("createAccessToken function", () => {
    it("should create accessToken correctly", async () => {
      // Arrange
      const payload = {
        username: "dicoding",
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => "mock_token"),
      };
      const jwtTokenManager = new JwtTokenManager({ token: mockJwtToken });

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(mockJwtToken.generate).toHaveBeenCalledWith(
        payload,
        process.env.ACCESS_TOKEN_KEY
      );
      expect(accessToken).toEqual("mock_token");
    });
  });

  describe("createRefreshToken function", () => {
    it("should create refreshToken correctly", async () => {
      // Arrange
      const payload = {
        username: "dicoding",
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => "mock_token"),
      };
      const jwtTokenManager = new JwtTokenManager({ token: mockJwtToken });

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toHaveBeenCalledWith(
        payload,
        process.env.REFRESH_TOKEN_KEY
      );
      expect(refreshToken).toEqual("mock_token");
    });
  });

  describe("verifyRefreshToken function", () => {
    it("should throw InvariantError when verification failed", async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt);
      const accessToken = await jwtTokenManager.createAccessToken({
        username: "dicoding",
      });

      // Action & Assert
      await expect(
        jwtTokenManager.verifyRefreshToken(accessToken)
      ).rejects.toThrow(InvariantError);
    });

    it("should not throw InvariantError when refresh token verified", async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt);
      const refreshToken = await jwtTokenManager.createRefreshToken({
        username: "dicoding",
      });

      // Action & Assert
      await expect(
        jwtTokenManager.verifyRefreshToken(refreshToken)
      ).resolves.not.toThrow(InvariantError);
    });
  });

  describe("decodePayload function", () => {
    it("should decode payload correctly", async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt);
      const accessToken = await jwtTokenManager.createAccessToken({
        username: "dicoding",
        id: "user-123",
      });

      // Action
      const { username, id } = await jwtTokenManager.decodePayload(accessToken);

      // Assert
      expect(username).toEqual("dicoding");
      expect(id).toEqual("user-123");
    });
  });
});
