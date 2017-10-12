import { RestRequestBodyType } from './Declarations';

export class RestHelper {

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

}
