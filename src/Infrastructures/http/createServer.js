import Hapi from "@hapi/hapi";
import users from "../../Interfaces/http/api/users";
import config from "../../Commons/config";

const createServer = async (container) => {
  const server = Hapi.server({
    host: config.app.host,
    port: config.app.port,
    debug: config.app.debug,
  });

  await server.register([
    {
      plugin: users,
      options: { container },
    },
  ]);

  return server;
};

export default createServer;
