import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ApiError } from "./ApiError.error";
import { logger } from "@/services/logging";
import { StatusCodes } from "http-status-codes";

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send(error.message);
  }
  logger.warn("An unknown error was caught", {
    message: error.message,
    statusCode: error.statusCode,
  });
  return reply
    .status(error.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR)
    .send({ message: "An error has occurred" });
}
