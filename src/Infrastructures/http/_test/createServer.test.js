/* eslint-disable no-undef */
import pool from "../../database/postgres/pool";
import UsersTableTestHelper from "../../../../tests/UsersTableTestHelper";
import container from "../../container";
import createServer from "../createServer";

describe("HTTP server", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  describe("when POST /users", () => {
    it("should response 201 and persisted user", async () => {
      // Arrange
      const requestPayload = {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/users",
        payload: requestPayload,
      });

      // Assert
      const repsonseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(repsonseJson.status).toEqual("success");
      expect(repsonseJson.data.addedUser).toBeDefined();
    });
  });
});
