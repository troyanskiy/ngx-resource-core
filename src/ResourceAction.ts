import { Resource } from './Resource';
import { IResourceAction, ResourceRequestMethod } from './Declarations';


export function ResourceAction(methodOptions?: IResourceAction) {

  methodOptions = methodOptions || {};

  if (methodOptions.method === undefined) {
    methodOptions.method = ResourceRequestMethod.Get;
  }

  return function (target: Resource, propertyKey: string) {

    (<any>target)[propertyKey] = function (...args: any[]): any {

      let callbacks: any = args.filter(arg => typeof arg === 'function');
      let data: any = args.filter(arg => typeof arg !== 'function');
      let body: any = data.length > 0 ? data[0];
      let query: any = data.length > 1 ? data[1];
      let params: any = data.length > 2 ? data[2];
      let onSuccess: any = callbacks.length > 0 ? callbacks[0];
      let onError: any = callbacks.length > 1 ? callbacks[1];

      //tslint:disable-next-line:no-invalid-this
      const actionOptions: IResourceAction = {...this.getResourceOptions(), ...methodOptions};


      //tslint:disable-next-line:no-invalid-this
      return this.$restAction({actionAttributes: {body, query, params, onSuccess, onError}, actionOptions});

    };

  };

}
