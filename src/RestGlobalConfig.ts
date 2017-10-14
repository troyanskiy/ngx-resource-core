import { RestGetParamsMappingType } from './Declarations';

export class RestGlobalConfig {
  static url: string | Promise<string> = null;
  static pathPrefix: string | Promise<string> = null;
  static path: string | Promise<string> = null;
  static headers: any | Promise<any> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  static body: any | Promise<any> = null;
  static params: any | Promise<any> = null;
  static query: any | Promise<any> = null;

  static removeTrailingSlash: boolean = true;
  static addTimestamp: boolean | string = false;
  static withCredentials: boolean = false;
  // static lean: boolean = null;
  static asPromise: boolean = true;
  // static toObservable: boolean = null;


  static getParamsMappingType: RestGetParamsMappingType = null;

}
