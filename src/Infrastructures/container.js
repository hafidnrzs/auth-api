/* istanbul ignore file */
import { createContainer } from "instances-container";

// external agency
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import Jwt from "@hapi/jwt";
import pool from "./database/postgres/pool.js";

// service (repository, helper, manager, etc)
import UserRepositoryPostgres from "./repository/UserRepositoryPostgres.js";
import AuthenticationRepositoryPostgres from "./repository/AuthenticationRepositoryPostgres.js";
import BcryptPasswordHash from "./security/BcryptPasswordHash.js";
import JwtTokenManager from "./security/JwtTokenManager.js";

// use case
import AddUserUseCase from "../Applications/use_case/AddUserUseCase.js";
import LoginUserUseCase from "../Applications/use_case/LoginUserUseCase.js";
import RefreshAuthenticationUseCase from "../Applications/use_case/RefreshAuthenticationUseCase.js";
import LogoutUserUseCase from "../Applications/use_case/LogoutUserUseCase.js";
import UserRepository from "../Domains/users/UserRepository.js";
import AuthenticationRepository from "../Domains/authentications/AuthenticationRepository.js";
import PasswordHash from "../Applications/security/PasswordHash.js";
import AuthenticationTokenManager from "../Applications/security/AuthenticationTokenManager.js";

// creating container
const container = createContainer();

// registering service and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }, { concrete: nanoid }],
    },
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [{ concrete: bcrypt }],
    },
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [{ concrete: Jwt }],
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "userRepository", internal: UserRepository.name },
        { name: "passwordHash", internal: PasswordHash.name },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        { name: "userRepository", internal: UserRepository.name },
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authenticationTokenManager",
          internal: AuthenticationTokenManager.name,
        },
        { name: "passwordHash", internal: PasswordHash.name },
      ],
    },
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authenticationTokenManager",
          internal: AuthenticationTokenManager.name,
        },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
      ],
    },
  },
]);

export default container;
