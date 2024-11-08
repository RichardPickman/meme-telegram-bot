export const ErrorResponse = (message: string) => ({
    statusCode: 200,
    status: 'error',
    message,
});

export const SUCCESSFUL_RESPONSE = {
    statusCode: 200,
    status: 'success',
    message: 'Nothing to report',
};
