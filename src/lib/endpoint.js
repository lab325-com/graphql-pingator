import { getHumanReadableDateDifference } from '@lib/date';
import { ENDPOINT_TYPE_REST } from '@constants/Endpoint';

export const getSelectedEndpointRepresentationText = endpoint => {
	let endpointsRepresentation = `✅ Selected endpoint <b>${endpoint.name}</b>\n`;
	
	if (endpoint.expireAt === null)
		endpointsRepresentation += `never expires ♾️\n`;
	else if (new Date().getTime() < new Date(endpoint.expireAt).getTime())
		endpointsRepresentation += `expires in: ${getHumanReadableDateDifference(new Date(), endpoint.expireAt)}\n`;
	else
		endpointsRepresentation += `already expired ⌛\n`;
	
	endpointsRepresentation += `url: ${endpoint.url}\n`;
	endpointsRepresentation += `type: ${endpoint.type}\n`;
	endpointsRepresentation += `data: ${endpoint.data}\n`;
	
	if (endpoint.type === ENDPOINT_TYPE_REST) {
		endpointsRepresentation += `http method: ${endpoint.httpMethod}\n`;
		endpointsRepresentation += `rest success status: ${endpoint.restSuccessStatus}\n`;
	}
	
	endpointsRepresentation += `\n📌 Click /delete or /edit`;
	
	return endpointsRepresentation;
};