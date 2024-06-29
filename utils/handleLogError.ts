import logger from "./logger";

export const handleLogError = (error: object)=>{
  try {
    logger.error(JSON.stringify(error));

  } catch (e){
    // eslint-disable-next-line no-console
    console.log('Error occurred in handleLogError function', e);
  }
};