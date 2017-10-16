import { RestRequestBodyType } from './Declarations';

export class RestHelper {

  static cleanDataFields: string[] = [
    '$resolved',
    '$promise',
    '$abort',
    '$resource'
  ];

  static getRealTypeOf(data: any): RestRequestBodyType {
    if (!data) {
      return RestRequestBodyType.NONE;
    }

    if (data instanceof FormData) {
      return RestRequestBodyType.FORM_DATA;
    }

    if (data instanceof Blob) {
      return RestRequestBodyType.BLOB;
    }

    if (data instanceof ArrayBuffer) {
      return RestRequestBodyType.ARRAY_BUFFER;
    }

    if (['string', 'number'].indexOf(typeof data) > -1) {
      return RestRequestBodyType.TEXT;
    }

    return RestRequestBodyType.JSON;
  }

  static defaults(dst: any, src: any): any {

    if (!dst) {
      dst = {};
    }

    Object.keys(src)
      .forEach((key: string) => {
        if (dst[key] === undefined) {
          dst[key] = src[key];
        }
      });

    return dst;

  }

  static isNullOrUndefined(value: any): boolean {
    return value === null || value === undefined;
  }

  static cleanData(obj: any): any {

    if (Array.isArray(obj)) {
      return this.cleanDataArray(obj);
    } else {
      return this.cleanDataObject(obj);
    }

  }

  static cleanDataArray(obj: any[]): any[] {
    for (const propName in obj) {

      if (typeof obj[propName] === 'function' || this.cleanDataFields.indexOf(propName) > -1) {
        delete obj[propName];
      }

    }

    return obj;
  }

  static cleanDataObject(obj: any): any {
    const cleanedObj: any = {};

    for (const propName in obj) {

      if (typeof obj[propName] !== 'function' && this.cleanDataFields.indexOf(propName) === -1) {
        cleanedObj[propName] = obj[propName];
      }

    }

    return cleanedObj;
  }

}
