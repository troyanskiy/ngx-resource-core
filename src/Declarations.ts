
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
  removeTrailingSlash?: boolean;
  // addTimestamp?: boolean | string;
  withCredentials?: boolean;
  // lean?: boolean;
  // toPromise?: boolean;
  requestBodyType?: RestRequestBodyType;
  // toObservable?: boolean;
  // bodySerializer?(body: any): string;
  responseBodyType?: RestResponseBodyType;
}


export interface IRestAction extends IRestParams {
  method?: RestRequestMethod; // get default
  // isArray?: boolean;
  // requestInterceptor?: IRestRequestInterceptor;
  // responseInterceptor?: IRestResponseInterceptor;
  // initResultObject?: IRestResponseInitResult;
  map?: IRestResponseMap;
  filter?: IRestResponseFilter;
  // model?: Type<RestModel<Rest>>;
  // useModel?: boolean;
  // rootNode?: string;
  // skipDataCleaning?: boolean;
}


export interface IRestResponseMap {
  (item: any): any;
}

export interface IRestResponseFilter {
  (item: any): boolean;
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
}

export interface IRestRequest {
  method?: RestRequestMethod;
  headers?: any;
  url?: string;
  withCredentials?: boolean;
  body?: any;
  query?: {[prop: string]: string};
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
