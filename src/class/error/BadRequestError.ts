export class BadRequestError extends Error {
  status: number = 400;
  constructor(message?: string) {
    super(message);
  }
}