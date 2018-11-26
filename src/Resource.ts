import {
  IResourceAction,
  IResourceActionInner,
  IResourceResponse,
  ResourceQueryMappingMethod,
  ResourceRequestBodyType,
  ResourceRequestMethod
} from './Declarations';
import { ResourceGlobalConfig } from './ResourceGlobalConfig';
import { ResourceHelper } from './ResourceHelper';
import { ResourceHandler } from './ResourceHandler';

export class Resource {

  private $url: string = null;
  private $pathPrefix: string = null;
  private $path: string = null;
  private $headers: any = null;
  private $body: any = null;
  private $params: any = null;
  private $query: any = null;

  constructor(protected requestHandler: ResourceHandler) {
    (this.constructor as any).instance = this;
  }

  /**
   * Used to get url
   *
   * @param {IResourceAction} actionOptions
   * @return {string | Promise<string>}
   */
  $getUrl(actionOptions: IResourceAction = {}): string | Promise<string> {
    return this.$url || actionOptions.url || ResourceGlobalConfig.url || '';
  }

  $setUrl(url: string) {
    this.$url = url;
  }

  /**
   * Used to get path prefix
   *
   * @param {IResourceAction} actionOptions
   * @return {string | Promise<string>}
   */
  $getPathPrefix(actionOptions: IResourceAction = {}): string | Promise<string> {
    return this.$pathPrefix || actionOptions.pathPrefix || ResourceGlobalConfig.pathPrefix || '';
  }

  $setPathPrefix(path: string) {
    this.$pathPrefix = path;
  }

  /**
   * Used to get path
   *
   * @param {IResourceAction} actionOptions
   * @return {string | Promise<string>}
   */
  $getPath(actionOptions: IResourceAction = {}): string | Promise<string> {
    return this.$path || actionOptions.path || ResourceGlobalConfig.path || '';
  }

  $setPath(path: string) {
    this.$path = path;
  }

  /**
   * Get headers.
   *
   * @param {IResourceAction} actionOptions
   * @return {any | Promise<any>}
   */
  $getHeaders(actionOptions: IResourceAction = {}): any | Promise<any> {
    return this.$headers || actionOptions.headers || ResourceGlobalConfig.headers || {};
  }

  $setHeaders(headers: any) {
    this.$headers = headers;
  }

  /**
   * Get body
   *
   * @param {IResourceAction} actionOptions
   * @return {any | Promise<any>}
   */
  $getBody(actionOptions: IResourceAction = {}): any | Promise<any> {
    return this.$body || actionOptions.body || ResourceGlobalConfig.body || {};
  }

  $setBody(body: any) {
    this.$body = body;
  }

  /**
   * Get path params
   *
   * @param {IResourceAction} actionOptions
   * @return {any | Promise<any>}
   */
  $getParams(actionOptions: IResourceAction = {}): any | Promise<any> {
    return this.$params || actionOptions.params || ResourceGlobalConfig.params || {};
  }

  $setParams(params: any) {
    this.$params = params;
  }

  /**
   * Get query params
   *
   * @param {IResourceAction} actionOptions
   * @return {any | Promise<any>}
   */
  $getQuery(actionOptions: IResourceAction = {}): any | Promise<any> {
    return this.$query || actionOptions.query || ResourceGlobalConfig.query || {};
  }

  $setQuery(query: any) {
    this.$query = query;
  }

  /**
   * Used to filter received data.
   * Is applied on each element of array or object
   *
   * @param data
   * @param {IResourceActionInner} options
   * @return {boolean}
   */
  $filter(data: any, options: IResourceActionInner = {}): boolean {
    return true;
  }

  /**
   * Used to map received data
   * Is applied on each element of array or object
   *
   * @param data
   * @param {IResourceActionInner} options
   * @return {any}
   */
  $map(data: any, options: IResourceActionInner = {}): any {
    return data;
  }

  /**
   * Used to create result object
   * Is applied on each element of array or object
   *
   * @param data
   * @param {IResourceActionInner} options
   * @return {any}
   */
  $resultFactory(data: any, options: IResourceActionInner = {}): any {
    return data || {};
  }

  $restAction(options: IResourceActionInner) {

    this.$_setResourceActionInnerDefaults(options);
    this.$_setResourceActionOptionDefaults(options);

    const actionOptions = options.actionOptions;

    if (actionOptions.mutateBody || options.isModel) {
      options.returnData = options.actionAttributes.body;
    }

    if (!actionOptions.asPromise) {
      options.returnData = actionOptions.expectJsonArray ? [] : actionOptions.resultFactory.call(this, null, options);
    }

    if (this.$_canSetInternalData(options)) {

      Object.defineProperty(options.returnData, '$resolved', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: false
      });

      Object.defineProperty(options.returnData, '$abort', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: () => {
          // does nothing for now
        }
      });

    }

    options.mainPromise = this.$_setResolvedOptions(options)
      .then((o: IResourceActionInner) => this.$_createRequestOptions(o))
      .then((o: IResourceActionInner) => {
        const handlerResp = this.requestHandler.handle(o.requestOptions);

        if (o.returnData && this.$_canSetInternalData(options)) {
          o.returnData.$abort = handlerResp.abort;
        }

        return handlerResp.promise;
      })
      .then((resp: IResourceResponse) => this.$handleSuccessResponse(options, resp))
      .catch((resp: IResourceResponse) => this.$handleErrorResponse(options, resp));


    if (this.$_canSetInternalData(options)) {

      Object.defineProperty(options.returnData, '$promise', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: options.mainPromise
      });

    }

    return actionOptions.asPromise ? options.mainPromise : options.returnData;

  }

  protected $handleSuccessResponse(options: IResourceActionInner, resp: IResourceResponse): any {

    let body = resp.body;

    const actionOptions = options.actionOptions;

    if (Array.isArray(body)) {

      body = body
        .filter((item: any) => actionOptions.filter.call(this, item, options))
        .map((item: any) => {
          item = actionOptions.map.call(this, item, options);

          return actionOptions.resultFactory.call(this, item, options);
        });

      if (options.returnData) {
        Array.prototype.push.apply(options.returnData, body);
        body = options.returnData;
      }

    } else {

      if (actionOptions.filter.call(this, body, options)) {

        body = actionOptions.map.call(this, body, options);

        let newBody = options.returnData;

        if (newBody) {
          if (typeof newBody.$setData === 'function') {
            newBody.$setData(body);
          } else {
            Object.assign(newBody, body);
          }
        } else {
          newBody = actionOptions.resultFactory.call(this, body, options);
        }

        body = newBody;

        // If it's model
        if (body.$resource) {
          body.$resolved = true;
          body.$promise = options.mainPromise;
          body.$abort = () => true;
        }

      } else {

        body = null;

      }
    }

    if (this.$_canSetInternalData(options)) {
      options.returnData.$resolved = true;
    }

    if (options.actionOptions.asResourceResponse) {
      resp.body = body;
      body = resp;
    }

    if (options.actionAttributes.onSuccess) {
      options.actionAttributes.onSuccess(body);
    }

    return body;
  }

  protected $handleErrorResponse(options: IResourceActionInner, resp: IResourceResponse): any {

    if (options.returnData && this.$_canSetInternalData(options)) {
      options.returnData.$resolved = true;
    }

    if (options.actionAttributes.onError) {
      options.actionAttributes.onError(resp);
    }

    throw resp;
  }

  protected $setRequestOptionsUrl(options: IResourceActionInner): void {

    const ro = options.requestOptions;

    if (!ro.url) {
      ro.url =
        options.resolvedOptions.url +
        options.resolvedOptions.pathPrefix +
        options.resolvedOptions.path;
    }


    options.usedInPath = {};

    const params = ResourceHelper.defaults(options.actionAttributes.params, options.resolvedOptions.params);
    const pathParams = ro.url.match(/{([^}]*)}/g) || [];


    for (let i = 0; i < pathParams.length; i++) {
      const pathParam = pathParams[i];

      let pathKey = pathParam.substr(1, pathParam.length - 2);
      const isMandatory = pathKey[0] === '!';
      if (isMandatory) {
        pathKey = pathKey.substr(1);
      }

      const onlyPathParam = pathKey[0] === ':';
      if (onlyPathParam) {
        pathKey = pathKey.substr(1);
      }

      if (options.actionAttributes.query && options.actionAttributes.query === options.actionAttributes.params) {
        options.usedInPath[pathKey] = true;
      }

      const value = params[pathKey];

      if (onlyPathParam) {
        delete params[pathKey];
      }

      if (ResourceHelper.isNullOrUndefined(value)) {
        if (isMandatory) {
          const consoleMsg = `Mandatory ${pathParam} path parameter is missing`;
          console.warn(consoleMsg);

          // shell.mainObservable = Observable.create((observer: any) => {
          //   observer.error(new Error(consoleMsg));
          // });
          //
          //
          // this.$_releaseMainDeferredSubscriber(shell);
          throw new Error(consoleMsg);
        }

        ro.url = ro.url.substr(0, ro.url.indexOf(pathParam));
        break;

      }

      // Replacing in the url
      ro.url = ro.url.replace(pathParam, value);

    }

    // Removing double slashed from final url
    ro.url = ro.url.replace(/\/\/+/g, '/');
    if (ro.url.startsWith('http')) {
      ro.url = ro.url.replace(':/', '://');
    }

    // Remove trailing slash
    if (options.actionOptions.removeTrailingSlash) {
      while (ro.url[ro.url.length - 1] === '/') {
        ro.url = ro.url.substr(0, ro.url.length - 1);
      }
    }

  }

  protected $setRequestOptionsBody(options: IResourceActionInner): void {

    let body = options.actionAttributes.body;

    if (!body) {
      return;
    }

    const realBodyType = ResourceHelper.getRealTypeOf(body);

    let bodyOk: boolean = realBodyType === options.actionOptions.requestBodyType;

    if (!bodyOk) {

      if (realBodyType === ResourceRequestBodyType.JSON) {

        if (options.actionOptions.requestBodyType === ResourceRequestBodyType.FORM_DATA) {

          const newBody = new FormData();

          Object.keys(body).forEach((key: string) => {

            const value = body[key];

            if (body.hasOwnProperty(key) && typeof value !== 'function') {

              const isArrayOfFiles = value instanceof Array && value.reduce((acc, elem) => acc && elem instanceof File, true);

              if (isArrayOfFiles) {
                value.forEach((f: File, index: number) => {
                  newBody.append(`${key}[${index}]`, f, (f as File).name);
                });
              } else if (value instanceof File) {
                newBody.append(key, value, (value as File).name);
              } else if (!options.actionOptions.rootNode) {
                newBody.append(key, value);
              }
            }

          });

          if (options.actionOptions.rootNode) {
            newBody.append(options.actionOptions.rootNode, JSON.stringify(body));
          }

          body = newBody;
          bodyOk = true;

        }

      }

    }

    if (!bodyOk) {
      throw new Error('Can not convert body');
    }

    if (!(body instanceof FormData)) {
      // Add root node if needed
      if (options.actionOptions.rootNode) {
        const newBody: any = {};
        newBody[options.actionOptions.rootNode] = body;
        body = newBody;
      }


      if ((options.actionOptions.requestBodyType === ResourceRequestBodyType.NONE ||
        (options.actionOptions.requestBodyType === ResourceRequestBodyType.JSON &&
        typeof body === 'object' && Object.keys(body).length === 0)
    ) && !options.actionOptions.keepEmptyBody) {
      return;
      }

    }

    options.requestOptions.body = body;

  }

  protected $setRequestOptionsQuery(options: IResourceActionInner): void {

    let oq = options.actionAttributes.query || {};
    if (options.resolvedOptions.query) {
      oq = {...options.resolvedOptions.query, ...oq};
    }

    if (oq) {
      options.requestOptions.query = {};
      Object.keys(oq).forEach((key: string) => {
        if (oq.hasOwnProperty(key) && !options.usedInPath[key]) {
          this.$appendQueryParams(options.requestOptions.query, key, oq[key], options.queryMappingMethod);
        }
      });
    }

    if (options.actionOptions.addTimestamp) {
      options.requestOptions.query = options.requestOptions.query || {};
      this.$appendQueryParams(
        options.requestOptions.query,
        options.actionOptions.addTimestamp as string,
        Date.now().toString(10),
        options.queryMappingMethod);
    }

  }

  protected $appendQueryParams(query: { [prop: string]: string | any[] },
                               key: string,
                               value: any,
                               queryMappingMethod: ResourceQueryMappingMethod): void {

    if (value instanceof Date) {
      query[key] = value.toISOString();

      return;
    }

    if (typeof value === 'object') {

      switch (queryMappingMethod) {

        case ResourceQueryMappingMethod.Plain:

          if (Array.isArray(value)) {
            query[key] = value.join(',');
            // for (const arrValue of value) {
            //   query[key] = arrValue;
            // }
          } else {

            if (value && typeof value === 'object') {
              /// Convert dates to ISO format string
              if (value instanceof Date) {
                value = value.toISOString();
              } else {
                value = JSON.stringify(value);
              }
            }
            query[key] = value;

          }

          return;

        case ResourceQueryMappingMethod.Bracket:
          /// Convert object and arrays to query params
          for (const k in value) {
            if (value.hasOwnProperty(k)) {
              this.$appendQueryParams(query, `${key}[${k}]`, value[k], queryMappingMethod);
            }
          }

          return;

        case ResourceQueryMappingMethod.JQueryParamsBracket:
          /// Convert object and arrays to query params according to $.params
          for (const k in value) {
            if (value.hasOwnProperty(k)) {
              let path = `${key}[${k}]`;
              if (Array.isArray(value) && typeof value[<any>k] !== 'object') {
                path = `${key}[]`;
              }
              this.$appendQueryParams(query, path, value[k], queryMappingMethod);
            }
          }

          return;

      }

    }

    query[key] = value;

  }

  protected $_setResourceActionInnerDefaults(options: IResourceActionInner) {
    const actionOptions = options.actionOptions;

    // Setting default request method
    if (!actionOptions.method) {
      actionOptions.method = ResourceRequestMethod.Get;
    }

    const actionAttributes = options.actionAttributes;

    if (actionAttributes.body) {

      // Setting default request content type
      if (!actionOptions.requestBodyType) {
        actionOptions.requestBodyType = ResourceHelper.getRealTypeOf(actionAttributes.body);
      }


      // Setting params and query if needed
      if (actionOptions.requestBodyType === ResourceRequestBodyType.JSON &&
        typeof actionAttributes.body === 'object' && !Array.isArray(actionAttributes.body)) {

        if (!actionAttributes.params) {
          actionAttributes.params = actionAttributes.body;
        }

        options.isModel = !!actionAttributes.body.$resource;

      }

    }

    actionAttributes.params = actionAttributes.params || {};

    if (!actionAttributes.query && actionOptions.method === ResourceRequestMethod.Get) {
      actionAttributes.query = actionAttributes.params;
    }

    options.queryMappingMethod = actionOptions.queryMappingMethod || ResourceGlobalConfig.queryMappingMethod;

  }

  protected $_setResourceActionOptionDefaults(options: IResourceActionInner) {

    const actionOptions = options.actionOptions;

    if (ResourceHelper.isNullOrUndefined(actionOptions.filter)) {
      actionOptions.filter = this.$filter;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.map)) {
      actionOptions.map = this.$map;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.resultFactory)) {
      actionOptions.resultFactory = this.$resultFactory;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.removeTrailingSlash)) {
      actionOptions.removeTrailingSlash = ResourceGlobalConfig.removeTrailingSlash;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.withCredentials)) {
      actionOptions.withCredentials = ResourceGlobalConfig.withCredentials;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.asPromise)) {
      actionOptions.asPromise = ResourceGlobalConfig.asPromise;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.asResourceResponse)) {
      actionOptions.asResourceResponse = ResourceGlobalConfig.asResourceResponse;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.responseBodyType)) {
      actionOptions.responseBodyType = ResourceGlobalConfig.responseBodyType;
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.lean)) {
      actionOptions.lean = ResourceGlobalConfig.lean;

      if (actionOptions.mutateBody && !actionOptions.asPromise && ResourceHelper.isNullOrUndefined(actionOptions.lean)) {
        actionOptions.lean = true;
      }
    }

    if (ResourceHelper.isNullOrUndefined(actionOptions.addTimestamp)) {
      actionOptions.addTimestamp = ResourceGlobalConfig.addTimestamp;

      if (actionOptions.addTimestamp && typeof actionOptions.addTimestamp !== 'string') {
        actionOptions.addTimestamp = 'ts';
      }
    }
  }

  protected $_setResolvedOptions(options: IResourceActionInner): Promise<IResourceActionInner> {
    return Promise.all([
      this.$getUrl(options.actionOptions),
      this.$getPathPrefix(options.actionOptions),
      this.$getPath(options.actionOptions),
      this.$getHeaders(options.actionOptions),
      this.$getBody(options.actionOptions),
      this.$getParams(options.actionOptions),
      this.$getQuery(options.actionOptions)
    ])
      .then((resolvedMain: any[]) => {
        options.resolvedOptions = {};
        const r = options.resolvedOptions;
        [r.url, r.pathPrefix, r.path, r.headers, r.body, r.params, r.query] = resolvedMain;

        return options;
      });
  }

  protected $_createRequestOptions(options: IResourceActionInner): IResourceActionInner | Promise<IResourceActionInner> {

    options.requestOptions = {};

    // Step 1 set main
    options.requestOptions.method = options.actionOptions.method;
    options.requestOptions.headers = options.resolvedOptions.headers;
    options.requestOptions.withCredentials = options.actionOptions.withCredentials;
    options.requestOptions.responseBodyType = options.actionOptions.responseBodyType;
    options.requestOptions.requestBodyType = options.actionOptions.requestBodyType;

    // Step 2 create url
    this.$setRequestOptionsUrl(options);

    // Step 3 create body
    this.$setRequestOptionsBody(options);

    // Step 4 set query params
    this.$setRequestOptionsQuery(options);

    return options;
  }

  protected $_canSetInternalData(options: IResourceActionInner): boolean {
    return options.returnData && (!options.actionOptions.lean || options.isModel);
  }

}
