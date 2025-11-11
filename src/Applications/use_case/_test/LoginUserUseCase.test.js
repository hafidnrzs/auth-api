import { describe, it, expect, jest } from "@jest/globals";
import LoginUserUseCase from "../LoginUserUseCase.js";
import Authentication from "../../../Domains/authentications/entities/Authentication.js";
import UserRepository from "../../../Domains/users/UserRepository.js";
import AuthenticationRepository from "../../../Domains/authentications/AuthenticationRepository.js";
import AuthenticationTokenManager from "../../security/AuthenticationTokenManager.js";
import PasswordHash from "../../security/PasswordHash.js";

describe("LoginUserUseCase", () => {
  it("should orchestrating the login action correctly", async () => {
    // Arrange
    const useCasePayload = {
      username: "dicoding",
      password: "secret",
    };

    const expectedAuthentication = new Authentication({
      accessToken: "access_token",
      refreshToken: "refresh_token",
    });

    const mockUserRepository = new UserRepository();
    const mockAuthenticationRepository = new AuthenticationRepository();
    const mockAuthenticationTokenManager = new AuthenticationTokenManager();
    const mockPasswordHash = new PasswordHash();

    mockUserRepository.getPasswordByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve("encrypted_password"));

    mockPasswordHash.comparePassword = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockUserRepository.getIdByUsername = jest
      .fn()
      .mockImplementation(() => Promise.resolve("user-123"));
    mockAuthenticationTokenManager.createAccessToken = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(expectedAuthentication.accessToken)
      );
    mockAuthenticationTokenManager.createRefreshToken = jest
      .fn()
      .mockImplementation(() =>
        Promise.resolve(expectedAuthentication.refreshToken)
      );
    mockAuthenticationRepository.addToken = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const loginUserUseCase = new LoginUserUseCase({
      userRepository: mockUserRepository,
      authenticationRepository: mockAuthenticationRepository,
      authenticationTokenManager: mockAuthenticationTokenManager,
      passwordHash: mockPasswordHash,
    });

    // Action
    const actualAuthentication = await loginUserUseCase.execute(useCasePayload);

    // Assert
    expect(actualAuthentication).toEqual(expectedAuthentication);
    expect(mockUserRepository.getPasswordByUsername).toHaveBeenCalledWith(
      "dicoding"
    );
    expect(mockPasswordHash.comparePassword).toHaveBeenCalledWith(
      "secret",
      "encrypted_password"
    );
    expect(mockUserRepository.getIdByUsername).toHaveBeenCalledWith("dicoding");
    expect(
      mockAuthenticationTokenManager.createAccessToken
    ).toHaveBeenCalledWith({ username: "dicoding", id: "user-123" });
    expect(
      mockAuthenticationTokenManager.createRefreshToken
    ).toHaveBeenCalledWith({ username: "dicoding", id: "user-123" });
    expect(mockAuthenticationRepository.addToken).toHaveBeenCalledWith(
      expectedAuthentication.refreshToken
    );
  });
});
