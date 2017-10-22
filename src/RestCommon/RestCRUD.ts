import { Rest } from '../Rest';
import { RestAction } from '../RestAction';
import { IRestMethod, RestRequestMethod } from '../Declarations';


export abstract class RestCRUD<TQuery, TShort, TFull> extends Rest {

  @RestAction()
  query: IRestMethod<TQuery, TShort[]>;

  @RestAction({
    path: '/{!id}'
  })
  get: IRestMethod<{ id: any }, TFull>;

  @RestAction({
    method: RestRequestMethod.Post
  })
  save: IRestMethod<TFull, TFull>;

  @RestAction({
    method: RestRequestMethod.Put,
    path: '/{!id}'
  })
  update: IRestMethod<TFull, TFull>;

  @RestAction({
    method: RestRequestMethod.Delete,
    path: '/{!id}'
  })
  remove: IRestMethod<{ id: any }, any>;

  // Alias to save
  create(data: TFull, callback?: (res: TFull) => any): Promise<TFull> {
    return this.save(data, callback);
  }

}
