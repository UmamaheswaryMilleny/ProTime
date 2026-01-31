export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export const COOKIES_NAMES = {
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_TOKEN: 'access_token',
};

export const ERROR_MESSAGE = {
  AUTHENTICATION: {
    SERVER_ERROR: 'internal server error',
    UNAUTHORIZED_ROLE: 'admin is not found',
    USER_REGISTRATION_FAILED: 'User registration failed',
    USER_ID_OR_EMAIL_OR_ROLE_MISSING: 'User id, email or role is missing',
    USER_ID_NOT_FOUND: 'User Id not found',
    INVALID_USER_TYPE: 'invalid user type ! expect client or vendor',
    INVALID_ROLE_FOR_REGISTRATION: 'Invalid role for client registration',
    USER_TYPE_AND_ID_REQUIRED: 'user type and id are required',
    USER_BLOCKED: 'User blocked successfully',
    USER_UNBLOCKED: 'User unblocked successfully',
    ID_AND_STATUS_REQUIRED: 'Id and status are required',
    USER_NOT_FOUND: 'User not found',
    FORBIDDEN:
      'Access denied. You do not have permission to access this resource.',
    EMAIL_NOT_FOUND: 'email doesnt exists',
    EMAIL_EXISTS: 'email already exists',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_ALREADY_REGISTERED_GOOGLE:
      'This email is alreday registered under a different role . Please use a different Google account',
    PASSWORD_AND_CONFIRM_PASSWORD_REQUIRED:
      'Password and confirm password is required',
    PASSWORD_AND_CONFIRM_PASSWORD_MUST_BE_SAME:
      'Password and confirm password must be same',
    PASSWORD_INCORRECT: 'Invalid credentials',
    INVALID_OTP: 'invalid otp',
    TOKEN_MISSING: 'Authorization token is required',
    TOKEN_EXPIRED_REFRESH: 'Token time out, Please loggin again',
    UNAUTHORIZED_ACCESS: 'Unauthorized access',
    TOKEN_EXPIRED_ACCESS: 'Access token expired',
    INVALID_TOKEN: 'Invalid token',
  },
  USER: {
    NOT_FOUND: "User not found",
    NOT_FOUND_AFTER_UPDATE: "User not found after update",
    ALREADY_EXISTS: "User already exists",
    BLOCKED: "User blocked successfully",
    UNBLOCKED: "User unblocked successfully",
  },
};

export const SUCCESS_MESSAGE = {
  AUTHORIZATION: {
    ACCOUNT_CREATED: `Account created succesfully`,
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logout successfully!',
    OTP_RESENT_SUCCESS: 'OTP resend successfully',
    OTP_SEND_SUCCESS: 'Otp send successfully',
    OTP_VERIFIED: 'Otp verified successfully',
    USER_BLOCKED: 'User blocked successfully',
    USER_UNBLOCKED: 'User unblocked successfully',
    NOT_BLOCKED: 'User is not blocked. Middleware passed',
  },
    
};



export const ROLES = {
  ADMIN: 'admin',
  USER: 'client',
} as const;

export const EVENT_EMMITER_TYPE = {
  SENDMAIL: 'SENDMAIL',
};

export enum MAIL_CONTENT_PURPOSE {
  LOGIN = 'login',
  OTP = 'otp',
}
