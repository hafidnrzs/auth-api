import AuthUser from "../../Domains/authentications/entities/AuthUser.js";
import Authentication from "../../Domains/authentications/entities/Authentication.js";

class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authenticationTokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const { username, password } = new AuthUser(useCasePayload);

    const hashedPassword = await this._userRepository.getPasswordByUsername(
      username
    );
    await this._passwordHash.comparePassword(password, hashedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const accessToken =
      await this._authenticationTokenManager.createAccessToken({
        username,
        id,
      });
    const refreshToken =
      await this._authenticationTokenManager.createRefreshToken({
        username,
        id,
      });

    await this._authenticationRepository.addToken(refreshToken);

    return new Authentication({
      accessToken,
      refreshToken,
    });
  }
}

export default LoginUserUseCase;
