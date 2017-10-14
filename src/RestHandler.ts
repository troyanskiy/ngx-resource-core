import { IRestHandlerResponse, IRestRequest } from './Declarations';

export abstract class RestHandler {
  abstract handle(req: IRestRequest): IRestHandlerResponse;
}
