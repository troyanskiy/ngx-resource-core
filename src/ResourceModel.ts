import { ResourceCRUD } from './ResourceCommon/ResourceCRUD';
import { ResourceHelper } from './ResourceHelper';

export abstract class ResourceModel {

  static resourceInstance: ResourceCRUD<any, any, any> = null;

  static get(id: string): Promise<any> {
    return this.getInstance().get({id});
  }

  static query(query?: any): Promise<any[]> {
    return this.getInstance().query(query);
  }

  static remove(id: string): Promise<void> {
    return this.getInstance().remove({id});
  }

  private static getInstance(): ResourceCRUD<any, any, any> {
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
    return this.$resource_method('create');
  }

  public $update() {
    return this.$resource_method('update');
  }

  public $remove() {
    return this.$resource_method('remove');
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
