const routes = (handler) => [
  {
    method: "POST",
    path: "/authentications",
    handler: handler.postAuthenticationHandler,
  },
];

export default routes;
