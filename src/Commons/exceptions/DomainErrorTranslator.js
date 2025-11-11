import InvariantError from "./InvariantError.js";

const DomainErrorTranslator = {
  translate(error) {
    switch (error.message) {
      // Register User
      case "REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY":
        return new InvariantError(
          "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada"
        );
      case "REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION":
        return new InvariantError(
          "tidak dapat membuat user baru karena tipe data tidak sesuai"
        );
      case "REGISTER_USER.USERNAME_LIMIT_CHAR":
        return new InvariantError(
          "tidak dapat membuat user baru karena karakter username melebihi batas limit"
        );
      case "REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER":
        return new InvariantError(
          "tidak dapat membuat user baru karena username mengandung karakter terlarang"
        );

      // Login User
      case "LOGIN_USER.NOT_CONTAIN_NEEDED_PROPERTY":
        return InvariantError("harus mengirimkan username dan password");
      case "LOGIN_USER.NOT_MEET_DATA_TYPE_SPECIFICATION":
        return InvariantError("username dan password harus string");

      // Authentication
      case "AUTH_USER.NOT_CONTAIN_NEEDED_PROPERTY":
        return InvariantError("harus mengirimkan username dan password");
      case "AUTH_USER.NOT_MEET_DATA_TYPE_SPECIFICATION":
        return InvariantError("username dan password harus string");
      case "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
        return new InvariantError("harus mengirimkan token refresh");
      case "REFRESH_AUTHENTICATION_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION":
        return new InvariantError("refresh token harus string");
      case "DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
        return new InvariantError("harus mengirimkan token refresh");
      case "DELETE_AUTHENTICATION_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION":
        return new InvariantError("refresh token harus string");
      default:
        return error;
    }
  },
};

export default DomainErrorTranslator;
