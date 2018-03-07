
export interface IResourceParamsBase {
  url?: string;
  pathPrefix?: string;
  path?: string;
  headers?: any;
  body?: any;
  params?: any;
  query?: any;
}

export interface IResourceParams extends IResourceParamsBase {
  rootNode?: string;
  removeTrailingSlash?: boolean;
  addTimestamp?: boolean | string;
  withCredentials?: boolean;
  lean?: boolean;
  mutateBody?: boolean;
  asPromise?: boolean;
  keepEmptyBody?: boolean;
  requestBodyType?: ResourceRequestBodyType;
  responseBodyType?: ResourceResponseBodyType;
  queryMappingMethod?: ResourceQueryMappingMethod;
  [prop: string]: any;
}

export interface IResourceAction extends IResourceParams {
  method?: ResourceRequestMethod; // get default
  expectJsonArray?: boolean;
  resultFactory?: IResourceResultFactory;
  map?: IResourceResponseMap;
  filter?: IResourceResponseFilter;
}

export interface IResourceResponseMap {
  (item: any, options: IResourceActionInner): any;
}

export interface IResourceResponseFilter {
  (item: any, options: IResourceActionInner): boolean;
}

export interface IResourceResultFactory {
  (item: any, options: IResourceActionInner): any;
}

export interface IResourceActionAttributes {
  body: any;
  query: any;
  params: any;
  onSuccess(data: any): any;
  onError(data: any): any;
}

export interface IResourceActionInner {
  actionAttributes?: IResourceActionAttributes;
  actionOptions?: IResourceAction;
  resolvedOptions?: IResourceParamsBase;

  queryMappingMethod?: ResourceQueryMappingMethod;

  usedInPath?: {[key: string]: boolean};
  mainPromise?: Promise<any>;
  isModel?: boolean;

  requestOptions?: IResourceRequest;

  returnData?: any;
}

export interface IResourceRequest {
  method?: ResourceRequestMethod;
  headers?: any;
  url?: string;
  withCredentials?: boolean;
  body?: any;
  query?: {[prop: string]: string};
  responseBodyType?: ResourceResponseBodyType;
  requestBodyType?: ResourceRequestBodyType;
}

export interface IResourceHandlerResponse {
  promise: Promise<IResourceResponse>;
  abort?(): void;
}

export interface IResourceResponse {
  status: number;
  headers?: any;
  body?: any;
}

export interface IResourceMethodStrict<IB, IQ, IP, O> {
  (body: IB,
   query: IQ,
   params: IP,
   onSuccess?: (data: O) => any,
   onError?: (err: IResourceResponse) => any): Promise<O>;

  (body: IB,
   query: IQ,
   onSuccess?: (data: O) => any,
   onError?: (err: IResourceResponse) => any): Promise<O>;

  (body: IB,
   onSuccess?: (data: O) => any,
   onError?: (err: IResourceResponse) => any): Promise<O>;

  (onSuccess?: (data: O) => any,
   onError?: (err: IResourceResponse) => any): Promise<O>;

}

export interface IResourceMethodResultStrict<IB, IQ, IP, O> {
  (body: IB,
   query: IQ,
   params: IP,
   onSuccess?: (data: ResourceResult<O>) => any,
   onError?: (err: IResourceResponse) => any): ResourceResult<O>;

  (body: IB,
   query: IQ,
   onSuccess?: (data: ResourceResult<O>) => any,
   onError?: (err: IResourceResponse) => any): ResourceResult<O>;

  (body: IB,
   onSuccess?: (data: ResourceResult<O>) => any,
   onError?: (err: IResourceResponse) => any): ResourceResult<O>;

  (onSuccess?: (data: ResourceResult<O>) => any,
   onError?: (err: IResourceResponse) => any): ResourceResult<O>;
}

export interface IResourceMethodResult<IB, O> extends IResourceMethodResultStrict<IB, any, any, O> {}

export interface IResourceMethod<IB, O> extends IResourceMethodStrict<IB, any, any, O> {}


export type ResourceResult<R extends {}> = R & {
  $resolved?: boolean;
  $promise?: Promise<R>;
  $abort?(): void;
};


export enum ResourceRequestBodyType {
  NONE = 0,
  JSON = 1,
  FORM = 2,
  FORM_DATA = 3,
  TEXT = 4,
  BLOB = 5,
  ARRAY_BUFFER = 6
}

export enum ResourceResponseBodyType {
  Text = 1,
  Json = 2,
  ArrayBuffer = 3,
  Blob = 4
}

export enum ResourceRequestMethod {
  Get = 1,
  Post = 2,
  Put = 3,
  Delete = 4,
  Options = 5,
  Head = 6,
  Patch = 7
}

export enum ResourceQueryMappingMethod {
  Plain = 1,
  Bracket = 2,
  JQueryParamsBracket = 3
}
