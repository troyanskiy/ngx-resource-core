import { Resource } from './Resource';
import { IResourceAction, ResourceRequestMethod } from './Declarations';


export function ResourceAction(methodOptions?: IResourceAction) {

  methodOptions = methodOptions || {};

  if (methodOptions.method === undefined) {
    methodOptions.method = ResourceRequestMethod.Get;
  }

  return function (target: Resource, propertyKey: string) {

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
      const actionOptions: IResourceAction = {...this.getResourceOptions(), ...methodOptions};


      //tslint:disable-next-line:no-invalid-this
      return this.$restAction({actionAttributes: {body, query, params, onSuccess, onError}, actionOptions});

    };

  };

}
