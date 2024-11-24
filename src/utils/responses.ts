export const ErrorResponse = (message: string) => ({
    statusCode: 200,
});

export const SuccessfullResponse = (
    message: string = 'Success. Nothing to report.',
) => ({
    statusCode: 200,
});
