import Hapi from "@hapi/hapi";
import users from "../../Interfaces/http/api/users";
import config from "../../Commons/config";
import DomainErrorTranslator from "../../Commons/exceptions/DomainErrorTranslator";
import ClientError from "../../Commons/exceptions/ClientError";

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

  server.ext("onPreResponse", (request, h) => {
    // get the response context from the request
    const { response } = request;

    if (response instanceof Error) {
      const translatedError = DomainErrorTranslator.translate(response);

      // internally handle client error
      if (translatedError instanceof ClientError) {
        const newResponse = h.response({
          status: "fail",
          message: translatedError.message,
        });
        newResponse.code(translatedError.statusCode);
        return newResponse;
      }

      if (!translatedError.isServer) {
        return h.continue;
      }

      // handle server error
      const newResponse = h.response({
        status: "error",
        message: "terjadi kegagalan pada server kami",
      });
      newResponse.code(500);
      return newResponse;
    }

    // if not error, continue with the prior response
    return h.continue;
  });

  return server;
};

export default createServer;
