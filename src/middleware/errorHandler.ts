import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  res.status(500).json({
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    }
  });
};

export default errorHandler;
