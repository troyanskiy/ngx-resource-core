import { ResourceQueryMappingMethod, ResourceResponseBodyType } from './Declarations';

export class ResourceGlobalConfig {
  static url: string | Promise<string> = null;
  static pathPrefix: string | Promise<string> = null;
  static path: string | Promise<string> = null;
  static headers: any | Promise<any> = null;
  static body: any | Promise<any> = null;
  static params: any | Promise<any> = null;
  static query: any | Promise<any> = null;

  static removeTrailingSlash: boolean = true;
  static addTimestamp: boolean | string = false;
  static withCredentials: boolean = false;
  static lean: boolean = null;
  static asPromise: boolean = true;
  // static toObservable: boolean = null;
  static asResourceResponse: boolean = false;
  static responseBodyType: ResourceResponseBodyType = ResourceResponseBodyType.Json;


  static queryMappingMethod: ResourceQueryMappingMethod = ResourceQueryMappingMethod.Plain;

}
