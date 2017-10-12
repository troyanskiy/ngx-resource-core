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

  static removeTrailingSlash: boolean = null;
  // static addTimestamp: boolean = null;
  static withCredentials: boolean = null;
  static lean: boolean = null;
  static toPromise: boolean = null;
  // static toObservable: boolean = null;

  // static add2Provides: boolean = null;

  static getParamsMappingType: RestGetParamsMappingType = null;

}
