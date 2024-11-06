export const ErrorResponse = (message: string) => ({
    statusCode: 200,
    body: JSON.stringify({ message }),
});

export const SUCCESSFUL_RESPONSE = {
    statusCode: 200,
};
