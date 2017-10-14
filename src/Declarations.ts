
export interface IRestParamsBase {
  url?: string;
  pathPrefix?: string;
  path?: string;
  headers?: any;
  body?: any;
  params?: any;
  query?: any;
}

export interface IRestParams extends IRestParamsBase {
  rootNode?: string;
  removeTrailingSlash?: boolean;
  addTimestamp?: boolean | string;
  withCredentials?: boolean;
  lean?: boolean;
  mutateBody?: boolean;
  asPromise?: boolean;
  requestBodyType?: RestRequestBodyType;
  responseBodyType?: RestResponseBodyType;
}


export interface IRestAction extends IRestParams {
  method?: RestRequestMethod; // get default
  expectJsonArray?: boolean;
  // requestInterceptor?: IRestRequestInterceptor;
  // responseInterceptor?: IRestResponseInterceptor;
  resultFactory?: IRestResultFactory;
  map?: IRestResponseMap;
  filter?: IRestResponseFilter;
  // model?: Type<RestModel<Rest>>;
  // useModel?: boolean;
  // skipDataCleaning?: boolean;
}


export interface IRestResponseMap {
  (item: any, options: IRestActionInner): any;
}

export interface IRestResponseFilter {
  (item: any, options: IRestActionInner): boolean;
}

export interface IRestResultFactory {
  (item: any, options: IRestActionInner): any;
}

export interface IRestActionAttributes {
  body: any;
  query: any;
  params: any;
  onSuccess(data: any): any;
  onError(data: any): any;
}

export interface IRestActionInner {
  actionAttributes?: IRestActionAttributes;
  actionOptions?: IRestAction;
  resolvedOptions?: IRestParamsBase;

  requestOptions?: IRestRequest;

  returnData?: any;
}

export interface IRestRequest {
  method?: RestRequestMethod;
  headers?: any;
  url?: string;
  withCredentials?: boolean;
  body?: any;
  query?: {[prop: string]: string};
  responseBodyType?: RestResponseBodyType;
}

export interface IRestHandlerResponse {
  promise: Promise<IRestResponse>;
  abort?(): void;
}

export interface IRestResponse {
  status: number;
  headers?: any;
  body?: any;
}


export enum RestRequestBodyType {
  NONE = 0,
  JSON = 1,
  FORM = 2,
  FORM_DATA = 3,
  TEXT = 4,
  BLOB = 5,
  ARRAY_BUFFER = 6
}

export enum RestResponseBodyType {
  Text = 1,
  Json = 2,
  ArrayBuffer = 3,
  Blob = 4
}

export enum RestRequestMethod {
  Get = 1,
  Post = 2,
  Put = 3,
  Delete = 4,
  Options = 5,
  Head = 6,
  Patch = 7
}

export enum RestGetParamsMappingType {
  Plain,
  Bracket,
  JQueryParamsBracket
}
