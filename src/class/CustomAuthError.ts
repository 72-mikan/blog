type ErrorType = "API_CONNECTION_ERROR"
                  |"NOT_EXISTS_USER_ERROR";

export class CustomAuthError extends Error {
  type: ErrorType;

  constructor(type: ErrorType, message?: string) {
    super(message);
    this.type = type;
  }
}