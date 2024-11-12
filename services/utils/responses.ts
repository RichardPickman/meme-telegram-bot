export const ErrorResponse = (message: string) => ({
    statusCode: 200,
    status: 'error',
    message: message,
});

export const SuccessfullResponse = (
    message: string = 'Success. Nothing to report.',
) => ({
    statusCode: 200,
    status: 'success',
    message: message,
});
