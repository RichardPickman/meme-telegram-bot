// DO NOT CHANGE THE RESPONSE OBJECT. MISFORMED RESPONSE GETTING IGNORED BY WEBHOOK, WHICH CREATES INFINITE LOOP OF MESSAGES

export const ErrorResponse = (message: string) => ({
    statusCode: 200,
});

export const SuccessfullResponse = (
    message: string = 'Success. Nothing to report.',
) => ({
    statusCode: 200,
});
