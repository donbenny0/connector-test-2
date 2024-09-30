import { Request, Response } from 'express';
import { apiSuccess } from '../api/success.api';
import CustomError from '../errors/custom.error';
import { cartController } from './cart.controller';
import { logger } from '../utils/logger.utils';

/**
 * Exposed service endpoint.
 * - Receives a POST request, parses the action and the controller
 * and returns it to the correct controller. We should be use 3. `Cart`, `Order` and `Payments`
 *
 * @param {Request} request The express request
 * @param {Response} response The express response
 * @returns
 */
export const post = async (request: Request, response: Response) => {
  try {
    logger.info(`Success in service : ${request.body}`);


    response.json({ "message": request.body })
    response.status(200).send();
  } catch (error) {
    logger.info(`Error in service : ${error}`);

    response.status(500);
    response.status(400).send();

    response.json({ "error": error })
  }
};
