import { ResourceCRUD } from './ResourceCommon/ResourceCRUD';
import { ResourceHelper } from './ResourceHelper';
import { IResourceMethod } from './Declarations';

export abstract class ResourceModel {

  static resourceInstance: ResourceCRUD<any, any, any> = null;

  protected static methodQuery: string = 'query';
  protected static methodGet: string = 'get';
  protected static methodCreate: string = 'create';
  protected static methodUpdate: string = 'update';
  protected static methodRemove: string = 'remove';

  static get(id: string | number): Promise<any> {
    return this.getInstance()[this.methodGet]({id});
  }

  static query(query?: any): Promise<any> {
    return this.getInstance()[this.methodQuery](query);
  }

  static remove(id: string | number): Promise<void> {
    return this.getInstance()[this.methodRemove]({id});
  }

  private static getInstance(): any {
    if (!this.resourceInstance) {

      const model: ResourceModel = (new (this as any)());

      if (!model.$resource) {
        throw new Error('Your resource is not defined');
      }

      if (!model.$resource.instance) {
        throw new Error('Your resource is not created (inject it somewhere)');
      }

      this.resourceInstance = (new (this as any)()).$resource.instance;
    }

    return this.resourceInstance;
  }

  abstract readonly $resource: any = null;

  $resolved: boolean = true;
  $promise: Promise<any> = null;
  $abort: () => void;


  public $setData(data: any) {
    Object.assign(this, data);

    return this;
  }

  public $save() {

    if (this.isNew()) {
      return this.$create();
    } else {
      return this.$update();
    }

  }

  public $create(query?: any, params?: any) {
    return this.$executeResourceMethod((this.constructor as any).methodCreate, query, params);
  }

  public $update(query?: any, params?: any) {
    return this.$executeResourceMethod((this.constructor as any).methodUpdate, query, params);
  }

  public $remove(query?: any, params?: any) {
    return this.$executeResourceMethod((this.constructor as any).methodRemove, query, params);
  }

  public toJSON(): any {
    return ResourceHelper.cleanData(this);
  }

  protected isNew(): boolean {
    return !(<any>this)['id'];
  }

  protected $getResourceMethod(methodName: string): IResourceMethod<any, this> {

    if (!this.$resource) {
      console.error(`Your Resource is not defined`);

      return null;
    }

    const restInstance = this.$resource.instance;

    if (!restInstance) {
      console.error(`Your Resource is not defined or not created`);

      return null;
    }

    if (!restInstance[methodName]) {
      console.error(`Your Resource has no implemented ${methodName} method.`);

      return null;
    }

    return restInstance[methodName];

  }

  protected $executeResourceMethod(methodName: string, query?: any, params?: any) {

    const method = this.$getResourceMethod(methodName);

    if (method) {
      method(this, query, params);
    }

    return this;
  }


}
