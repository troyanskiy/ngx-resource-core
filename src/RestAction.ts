import { Rest } from './Rest';
import { IRestAction, RestRequestMethod } from './Declarations';


export function RestAction(methodOptions?: IRestAction) {

  methodOptions = methodOptions || {};

  if (methodOptions.method === undefined) {
    methodOptions.method = RestRequestMethod.Get;
  }

  return function (target: Rest, propertyKey: string) {

    (<any>target)[propertyKey] = function (...args: any[]): any {

      let body: any = null;
      let query: any = null;
      let params: any = null;
      let onSuccess: any = null;
      let onError: any = null;

      for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (typeof arg === 'function') {
          if (onSuccess) {
            onError = arg;
          } else {
            onSuccess = arg;
          }
        } else {
          if (!body) {
            body = arg;
          } else if (!query) {
            query = arg;
          } else {
            params = arg;
          }
        }

      }

      //tslint:disable-next-line:no-invalid-this
      const actionOptions: IRestAction = {...this.getRestOptions(), ...methodOptions};


      //tslint:disable-next-line:no-invalid-this
      return this.$restAction({actionAttributes: {body, query, params, onSuccess, onError}, actionOptions});

    };

  };

}
