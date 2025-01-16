// This function wraps an async function with error handling
const catchAsync = (fn) => {
    // Define an error handling middleware function
    const errorHandler = (req, res, next) => {
        // Call the wrapped async function and catch any errors
        fn(req, res, next).catch(next);
    };

    // Return the error handling middleware function
    return errorHandler;
};

// Export the catchAsync function
module.exports = catchAsync;
