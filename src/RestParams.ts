import { IRestParamsBase } from './Declarations';

export function RestParams(params: IRestParamsBase = {}) {

  return function (target: any) {

    target.prototype.getRestOptions = function () {
      return params;
    };

  };
}
