import { IRestRequest, IRestResponse } from './Declarations';

export abstract class RestHandler {
  abstract handle(req: IRestRequest): Promise<IRestResponse>;
}
