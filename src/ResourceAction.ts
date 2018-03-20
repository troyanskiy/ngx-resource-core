import { Resource } from './Resource';
import { IResourceAction, ResourceRequestMethod } from './Declarations';


export function ResourceAction(methodOptions?: IResourceAction) {

  methodOptions = methodOptions || {};

  if (methodOptions.method === undefined) {
    methodOptions.method = ResourceRequestMethod.Get;
  }

  return function (target: Resource, propertyKey: string) {

    (<any>target)[propertyKey] = function (...args: any[]): any {

      const callbacks: any = args.filter((arg: any) => typeof arg === 'function');
      const data: any = args.filter((arg: any)  => typeof arg !== 'function');

      const body: any = data[0];
      const query: any = data[1];
      const params: any = data[2];
      const onSuccess: any = callbacks[0];
      const onError: any = callbacks[1];


      //tslint:disable-next-line:no-invalid-this
      const actionOptions: IResourceAction = {...this.getResourceOptions(), ...methodOptions};


      //tslint:disable-next-line:no-invalid-this
      return this.$restAction({actionAttributes: {body, query, params, onSuccess, onError}, actionOptions});

    };

  };

}
