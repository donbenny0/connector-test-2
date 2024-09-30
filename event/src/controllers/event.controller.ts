import { Request, Response } from 'express';
import { createApiRoot } from '../client/create.client';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';

/**
 * Exposed event POST endpoint.
 * Receives the Pub/Sub message and works with it
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  try {
    logger.info(`Success in event : ${request.body}`);

    response.json({ "message": request.body })
    response.status(200).send();
  } catch (error) {
    logger.info(`Error in event : ${error}`);


    response.status(500);
    response.status(400).send();

    response.json({ "error": error })
  }
};
