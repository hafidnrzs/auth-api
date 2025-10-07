import { describe, it, expect } from "@jest/globals";
import NotFoundError from "../NotFoundError.js";

describe("NotFoundError", () => {
  it("should create NotFoundError correctly", () => {
    const notFoundError = new NotFoundError("not found!");

    expect(notFoundError.statusCode).toEqual(404);
    expect(notFoundError.message).toEqual("not found!");
    expect(notFoundError.name).toEqual("NotFoundError");
  });
});
