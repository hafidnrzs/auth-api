import AuthUser from "../AuthUser.js";
import { describe, it, expect } from "@jest/globals";

describe("AuthUser entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    const payload = {
      username: "dicoding",
    };

    expect(() => new AuthUser(payload)).toThrow(
      "AUTH_USER.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    const payload = {
      username: 123,
      password: "secret",
    };

    expect(() => new AuthUser(payload)).toThrow(
      "AUTH_USER.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should create auth object correctly", () => {
    const payload = {
      username: "dicoding",
      password: "secret",
    };

    const { username, password } = new AuthUser(payload);

    expect(username).toEqual(payload.username);
    expect(password).toEqual(payload.password);
  });
});
