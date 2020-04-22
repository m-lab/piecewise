import HttpError from 'http-errors';

export class BadRequestError extends HttpError {
  constructor(message, properties) {
    super(400, message, properties);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message, properties) {
    super(401, message, properties);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message, properties) {
    super(403, message, properties);
  }
}

export class NotFoundError extends HttpError {
  constructor(message, properties) {
    super(404, message, properties);
  }
}

export class UnprocessableError extends HttpError {
  constructor(message, properties) {
    super(422, message, properties);
  }
}

export class ServerError extends HttpError {
  constructor(message, properties) {
    super(500, message, properties);
  }
}
