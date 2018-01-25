import { ResourceCRUD } from './ResourceCommon/ResourceCRUD';
import { ResourceHelper } from './ResourceHelper';

export abstract class ResourceModel {

  static resourceInstance: ResourceCRUD<any, any, any> = null;

  protected static methodQuery: string = 'query';
  protected static methodGet: string = 'get';
  protected static methodCreate: string = 'create';
  protected static methodUpdate: string = 'update';
  protected static methodRemove: string = 'remove';

  static get(id: string): Promise<any> {
    return this.getInstance()[this.methodGet]({id});
  }

  static query(query?: any): Promise<any> {
    return this.getInstance()[this.methodQuery](query);
  }

  static remove(id: string): Promise<void> {
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

  public $create() {
    return this.$resource_method((this.constructor as any).methodCreate);
  }

  public $update() {
    return this.$resource_method((this.constructor as any).methodUpdate);
  }

  public $remove() {
    return this.$resource_method((this.constructor as any).methodRemove);
  }

  public toJSON(): any {
    return ResourceHelper.cleanData(this);
  }

  protected isNew(): boolean {
    return !(<any>this)['id'];
  }

  private $resource_method(methodName: string) {

    if (!this.$resource) {
      console.error(`Your Resource is not defined`);

      return this;
    }

    const restInstance = this.$resource.instance;

    if (!restInstance) {
      console.error(`Your Resource is not defined or not created`);

      return this;
    }

    if (!restInstance[methodName]) {
      console.error(`Your Resource has no implemented ${methodName} method.`);

      return this;
    }

    restInstance[methodName](this);

    return this;
  }


}
