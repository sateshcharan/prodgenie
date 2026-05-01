export class CustomError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 401; // Unauthorized
  }
}

export class InsufficientCreditsError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 402; // Payment Required
  }
}

export class PlanExpiredError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 403; // Forbidden
  }
}

export class NotFoundError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = 404; // Not Found
  }
}
