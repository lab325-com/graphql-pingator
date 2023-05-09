export const endpointQueueName = endpointId => `endpoint_${endpointId}`;
export const endpointExpirationAlertQueueName = endpointId => `${endpointQueueName(endpointId)}_expiration_alert`;