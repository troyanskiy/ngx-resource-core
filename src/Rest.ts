import {
  IRestAction,
  IRestActionInner,
  IRestResponse,
  RestGetParamsMappingType,
  RestRequestBodyType,
  RestRequestMethod
} from './Declarations';
import { RestGlobalConfig } from './RestGlobalConfig';
import { RestHelper } from './RestHelper';
import { RestHandler } from './RestHandler';

export class Rest {

  private $url: string = null;
  private $pathPrefix: string = null;
  private $path: string = null;
  private $headers: any = null;
  private $body: any = null;
  private $params: any = null;
  private $query: any = null;

  constructor(protected requestHandler: RestHandler) {
  }

  $getUrl(actionOptions: IRestAction): string | Promise<string> {
    return this.$url || actionOptions.url || RestGlobalConfig.url || '';
  }

  $setUrl(url: string) {
    this.$url = url;
  }

  $getPathPrefix(actionOptions: IRestAction): string | Promise<string> {
    return this.$pathPrefix || actionOptions.pathPrefix || RestGlobalConfig.pathPrefix || '';
  }

  $setPathPrefix(path: string) {
    this.$pathPrefix = path;
  }

  $getPath(actionOptions: IRestAction): string | Promise<string> {
    return this.$path || actionOptions.path || RestGlobalConfig.path || '';
  }

  $setPath(path: string) {
    this.$path = path;
  }

  $getHeaders(actionOptions: IRestAction): any | Promise<any> {
    return this.$headers || actionOptions.headers || RestGlobalConfig.headers || {};
  }

  $setHeaders(headers: any) {
    this.$headers = headers;
  }

  $getBody(actionOptions: IRestAction): any | Promise<any> {
    return this.$body || actionOptions.body || RestGlobalConfig.body || {};
  }

  $setBody(body: any) {
    this.$body = body;
  }

  $getParams(actionOptions: IRestAction): any | Promise<any> {
    return this.$params || actionOptions.params || RestGlobalConfig.params || {};
  }

  $setParams(params: any) {
    this.$params = params;
  }

  $getQuery(actionOptions: IRestAction): any | Promise<any> {
    return this.$query || actionOptions.query || RestGlobalConfig.query || {};
  }

  $setQuery(query: any) {
    this.$query = query;
  }

  $filter(data: any, options: IRestActionInner): boolean {
    return true;
  }

  $map(data: any, options: IRestActionInner): any {
    return data;
  }

  $resultFactory(data: any, options: IRestActionInner): any {
    return data || {};
  }

  $restAction(options: IRestActionInner) {

    this.$_setRestActionInnerDefaults(options);

    const actionOptions = options.actionOptions;

    if (!actionOptions.asPromise || actionOptions.mutateBody) {

      if (actionOptions.expectJsonArray) {
        options.returnData = [];
      } else {
        options.returnData = actionOptions.mutateBody ?
          options.actionAttributes.body :
          actionOptions.resultFactory.call(this, null, options);
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

    }

    const mainPromise = this.$_setResolvedOptions(options)
      .then((o: IRestActionInner) => this.$_createRequestOptions(o))
      .then((o: IRestActionInner) => {
        const handlerResp = this.requestHandler.handle(o.requestOptions);

        if (o.returnData && this.$_canSetInternalData(options)) {
          o.returnData.$abort = handlerResp.abort;
        }

        return handlerResp.promise;
      })
      .then((resp: IRestResponse) => this.$handleSuccessResponse(options, resp))
      .catch((resp: IRestResponse) => this.$handleErrorResponse(options, resp));



    if (actionOptions.asPromise) {

      return mainPromise;

    } else {

      if (this.$_canSetInternalData(options)) {

        Object.defineProperty(options.returnData, '$promise', {
          enumerable: false,
          configurable: true,
          writable: true,
          value: mainPromise
        });

      }

      return options.returnData;

    }


  }

  protected $handleSuccessResponse(options: IRestActionInner, resp: IRestResponse): any {

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
          if (newBody.$setData) {
            newBody.$setData(body);
          } else {
            Object.assign(newBody, body);
          }
        } else {
          newBody = actionOptions.resultFactory.call(this, body, options);
        }

        body = newBody;

      } else {

        body = null;

      }
    }

    if (options.returnData && this.$_canSetInternalData(options)) {
      options.returnData.$resolved = true;
    }

    if (options.actionAttributes.onSuccess) {
      options.actionAttributes.onSuccess(body);
    }

    return body;
  }

  protected $handleErrorResponse(options: IRestActionInner, resp: IRestResponse): any {

    if (options.returnData && this.$_canSetInternalData(options)) {
      options.returnData.$resolved = true;
    }

    if (options.actionAttributes.onError) {
      options.actionAttributes.onError(resp);
    }

    throw resp;
  }

  protected $setRequestOptionsUrl(options: IRestActionInner): void {

    const ro = options.requestOptions;

    if (!ro.url) {
      ro.url =
        options.resolvedOptions.url +
        options.resolvedOptions.pathPrefix +
        options.resolvedOptions.path;
    }


    const params = RestHelper.defaults(options.actionAttributes.params, options.resolvedOptions.params);
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

      const value = params[pathKey];

      if (onlyPathParam) {
        delete params[pathKey];
      }

      if (RestHelper.isNullOrUndefined(value)) {
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

  protected $setRequestOptionsBody(options: IRestActionInner): void {

    let body = options.actionAttributes.body;

    if (!body) {
      return;
    }

    const realBodyType = RestHelper.getRealTypeOf(body);

    let bodyOk: boolean = realBodyType === options.actionOptions.requestBodyType;

    if (!bodyOk) {

      if (realBodyType === RestRequestBodyType.JSON) {

        switch (options.actionOptions.requestBodyType) {

          case RestRequestBodyType.FORM_DATA:

            const newBody = new FormData();

            Object.keys(body).forEach((key: string) => {

              const value = body[key];

              if (body.hasOwnProperty(key) && typeof value !== 'function') {
                let fileName: string;
                if (value instanceof File) {
                  fileName = (value as File).name;
                }

                newBody.append(key, value, fileName);
              }

            });

            bodyOk = true;

        }

      }

    }

    if (!bodyOk) {
      throw new Error('Can not convert body');
    }


    // Add root node if needed
    if (options.actionOptions.rootNode) {
      const newBody: any = {};
      newBody[options.actionOptions.rootNode] = body;
      body = newBody;
    }

    options.requestOptions.body = body;

  }

  protected $setRequestOptionsQuery(options: IRestActionInner): void {

    const oq = options.actionAttributes.query;

    if (oq) {
      options.requestOptions.query = {};
      Object.keys(oq).forEach((key: string) => {
        if (oq.hasOwnProperty(key)) {
          this.$appendQueryParams(options.requestOptions.query, key, oq[key]);
        }
      });
    }

    if (options.actionOptions.addTimestamp) {
      options.requestOptions.query = options.requestOptions.query || {};
      this.$appendQueryParams(
        options.requestOptions.query,
        options.actionOptions.addTimestamp as string,
        Date.now().toString(10));
    }

  }

  protected $appendQueryParams(query: { [prop: string]: string }, key: string, value: any): void {

    if (value instanceof Date) {
      query[key] = value.toISOString();

      return;
    }

    if (typeof value === 'object') {

      switch (RestGlobalConfig.getParamsMappingType) {

        case RestGetParamsMappingType.Plain:

          if (Array.isArray(value)) {
            for (const arrValue of value) {
              query[key] = arrValue;
            }
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
          break;

        case RestGetParamsMappingType.Bracket:
          /// Convert object and arrays to query params
          for (const k in value) {
            if (value.hasOwnProperty(k)) {
              this.$appendQueryParams(query, `${key}[${k}]`, value[k]);
            }
          }
          break;

        case RestGetParamsMappingType.JQueryParamsBracket:
          /// Convert object and arrays to query params according to $.params
          for (const k in value) {
            if (value.hasOwnProperty(k)) {
              let path = `${key}[${k}]`;
              if (Array.isArray(value) && typeof value[<any>k] !== 'object') {
                path = `${key}[]`;
              }
              this.$appendQueryParams(query, path, value[k]);
            }
          }

      }

      return;
    }

    query[key] = value;

  }

  protected $_setRestActionInnerDefaults(options: IRestActionInner) {
    const actionOptions = options.actionOptions;

    // Setting default request method
    if (!actionOptions.method) {
      actionOptions.method = RestRequestMethod.Get;
    }

    const actionAttributes = options.actionAttributes;

    if (actionAttributes.body) {

      // Setting default request content type
      if (!actionOptions.requestBodyType) {
        actionOptions.requestBodyType = RestHelper.getRealTypeOf(actionAttributes.body);
      }


      // Setting params and query if needed
      if (actionOptions.requestBodyType === RestRequestBodyType.JSON &&
        typeof actionAttributes.body === 'object' && !Array.isArray(actionAttributes.body)) {

        if (!actionAttributes.params) {
          actionAttributes.params = actionAttributes.body;
        }

      }

    }

    actionAttributes.params = actionAttributes.params || {};

    if (!actionAttributes.query && actionOptions.method === RestRequestMethod.Get) {
      actionAttributes.query = actionAttributes.params;
    }

    if (RestHelper.isNullOrUndefined(actionOptions.filter)) {
      actionOptions.filter = this.$filter;
    }

    if (RestHelper.isNullOrUndefined(actionOptions.map)) {
      actionOptions.map = this.$map;
    }

    if (RestHelper.isNullOrUndefined(actionOptions.resultFactory)) {
      actionOptions.resultFactory = this.$resultFactory;
    }

    if (RestHelper.isNullOrUndefined(actionOptions.removeTrailingSlash)) {
      actionOptions.removeTrailingSlash = RestGlobalConfig.removeTrailingSlash;
    }

    if (RestHelper.isNullOrUndefined(actionOptions.withCredentials)) {
      actionOptions.withCredentials = RestGlobalConfig.withCredentials;
    }

    if (RestHelper.isNullOrUndefined(actionOptions.asPromise)) {
      actionOptions.asPromise = RestGlobalConfig.asPromise;
    }

    if (RestHelper.isNullOrUndefined(actionOptions.addTimestamp)) {
      actionOptions.addTimestamp = RestGlobalConfig.addTimestamp;

      if (typeof actionOptions.addTimestamp !== 'string') {
        actionOptions.addTimestamp = 'ts';
      }
    }
  }

  protected $_setResolvedOptions(options: IRestActionInner): Promise<IRestActionInner> {
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

  protected $_createRequestOptions(options: IRestActionInner): IRestActionInner | Promise<IRestActionInner> {

    options.requestOptions = {};

    // Step 1 set main
    options.requestOptions.method = options.actionOptions.method;
    options.requestOptions.headers = options.actionOptions.headers;
    options.requestOptions.withCredentials = options.actionOptions.withCredentials;

    // Step 2 create url
    this.$setRequestOptionsUrl(options);

    // Step 3 create body
    this.$setRequestOptionsBody(options);

    // Step 4 set query params
    this.$setRequestOptionsQuery(options);

    return options;
  }

  protected $_canSetInternalData(options: IRestActionInner): boolean {
    return !options.actionOptions.lean;
  }

}
