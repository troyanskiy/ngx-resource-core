import { RestHelper } from './RestHelper';

export abstract class RestModel {

  abstract readonly $rest: any = null;

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
    return RestHelper.cleanData(this);
  }

  protected isNew(): boolean {
    return !(<any>this)['id'];
  }

  private $resource_method(methodName: string) {

    if (!this.$rest) {
      console.error(`Your Rest is not defined`);

      return this;
    }

    const restInstance = this.$rest.instance;

    if (!restInstance) {
      console.error(`Your Rest is not defined or not created`);

      return this;
    }

    if (!restInstance[methodName]) {
      console.error(`Your Rest has no implemented ${methodName} method.`);

      return this;
    }

    restInstance[methodName](this);

    return this;
  }


}
