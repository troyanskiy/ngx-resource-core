import { IResourceParams } from './Declarations';

export function ResourceParams(params: IResourceParams = {}) {

  return function (target: any) {

    target.prototype.getResourceOptions = function () {
      return params;
    };

  };
}
