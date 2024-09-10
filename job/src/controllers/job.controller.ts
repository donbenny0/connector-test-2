import { Request, Response } from 'express';
import AWS from 'aws-sdk';
import CustomError from '../errors/custom.error';
import { logger } from '../utils/logger.utils';
import { allOrders } from '../orders/fetch.orders';

// Configure AWS SDK
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN
});

const s3 = new AWS.S3();
const bucketName = process.env.S3_BUCKET_NAME || 'innovation-training-2024';
const folderName = process.env.S3_FOLDER_NAME || 'don';

export const post = async (_request: Request, response: Response) => {
  try {
    // Get current date and time
    const now = new Date();

    // Calculate the timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Format the current date-time for the filename
    const dateTime = now.toISOString().replace(/[:T]/g, '_').split('.')[0];
    const fileName = `${folderName}/orders_last_24h_${dateTime}.csv`;

    // Format timestamps for the query
    const endTime = now.toISOString();
    const startTime = twentyFourHoursAgo.toISOString();

    // Get the orders for the last 24 hours
    const orders = await allOrders({
      where: `createdAt >= "${startTime}" and createdAt <= "${endTime}"`
    });

    // Extract order IDs
    const orderIds = orders.results.map(order => order.id);

    // Create CSV content
    const csvContent = 'OrderID\n' + orderIds.join('\n');

    // Upload CSV to AWS S3
    await uploadCSVToS3(csvContent, fileName);

    logger.info(`Orders from the last 24 hours have been written to ${fileName} in S3 bucket ${bucketName}`);
    response.status(200).send(`Orders from the last 24 hours have been written to ${fileName} in S3 bucket ${bucketName}`);
  } catch (error) {
    logger.error('Error while fetching and uploading orders', error);
    throw new CustomError(
      500,
      `Internal Server Error - Error retrieving and uploading orders to S3`
    );
  }
};

const uploadCSVToS3 = async (csvContent: string, destFileName: string): Promise<void> => {
  const params = {
    Bucket: bucketName,
    Key: destFileName,
    Body: csvContent,
    ContentType: 'text/csv'
  };

  try {
    await s3.putObject(params).promise();
  } catch (error) {
    logger.error('Error uploading to S3', error);
    throw new CustomError(500, 'Error uploading file to S3');
  }
};