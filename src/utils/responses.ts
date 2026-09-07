/**
 * Adding a message to response object breaks api call, and considered falty, which leads to infinite retires.
 */

export const ErrorResponse = (message: string) => ({
    statusCode: 200,
});

export const SuccessfullResponse = (
    message: string = 'Success. Nothing to report.',
) => ({
    statusCode: 200,
});
