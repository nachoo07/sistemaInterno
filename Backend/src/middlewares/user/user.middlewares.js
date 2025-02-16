export const errorHandler = (err, req, res, next) => {
    console.error(err); // Log en la consola
  
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";
  
    res.status(statusCode).json({
      success: false,
      message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };