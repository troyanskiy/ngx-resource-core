import { IRestParams } from './Declarations';

export function RestParams(params: IRestParams = {}) {

  return function (target: any) {

    target.prototype.getRestOptions = function () {
      return params;
    };

  };
}
