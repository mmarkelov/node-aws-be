const generatePolicy = (principalId, resource, effect = "Deny") => ({
    principalId,
    policyDocument: {
        Version: "2012-10-17",
        Statement: {
            Action: "execute-api:Invoke",
            Effect: effect,
            Resource: resource,
        },
    },
});

export const basicAuthorizer = (event, _context, callback) => {
    console.log("Event: ", JSON.stringify(event));

    if (event["type"] !== "TOKEN") {
        callback("Unauthorized");
    }

    try {
        const {authorizationToken} = event;
        const encodedCreds = authorizationToken.split(" ")[1];
        const buff = Buffer.from(encodedCreds, "base64");
        const plainCreds = buff.toString("utf-8").split(":");
        const [username, password] = plainCreds;

        const storedUserPassword = process.env[username];
        const effect =
            !storedUserPassword || storedUserPassword !== password ? "Deny" : "Allow";
        const policy = generatePolicy(encodedCreds, event.methodArn, effect);

        callback(null, policy);
    } catch (err) {
        callback(`Unauthorized: ${err.message}`);
    }
}
