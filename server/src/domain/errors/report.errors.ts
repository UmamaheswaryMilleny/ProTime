import { DomainError } from './base-domain.error';


export class ReportValidationError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class SelfReportError extends DomainError {
  constructor() {
    super('You cannot report yourself');
  }
}


export class ReportNotFoundError extends DomainError {
  constructor() {
    super('Report not found');
  }
}


export class DuplicateReportError extends DomainError {
  constructor() {
    super('You already have a pending report against this user');
  }
}


export class ReportAlreadyResolvedError extends DomainError {
  constructor() {
    super('This report has already been resolved');
  }
}