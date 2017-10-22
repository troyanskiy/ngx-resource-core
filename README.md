[![npm version](https://badge.fury.io/js/rest-core.svg)](http://badge.fury.io/js/rest-core)

[![NPM](https://nodei.co/npm/rest-core.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/rest-core/)

# rest-core
Rest Core is an evolution of ngx-resource lib which provides freedom for the developers. Each developer can implement his own request handlers.
In fact, `rest-core` is an abstract common library which uses abstract `RestHandler` to make an requests, so it's even possible to use the lib on node.js server side with typescript. Just need to implement `RestHandler` for it.

All my examples will be based on angalar 4.4.4+

For angular, I have implemented `rest-ngx` library, which includes `module` and `handler`.

## Creation of rest class

```typescript
@Injectable()
@RestParams({
  // IRestParams
  pathPrefix: '/auth'
})
export class MyAuthRest extends Rest {

  @RestAction({
    // IRestAction
    method: RestRequestMethod.Post
    path: '/login'
  })
  login: IRestMethod<{login: string, password: string}, IReturnData>; // will make an post request to /auth/login

  @RestAction({
    // IRestAction
    //method: RestRequestMethod.Get is by default
    path: '/logout'
  })
  logout: IRestMethod<void, void>;
  
  constructor(restHandler: RestHandler) {
    super(restHandler);
  }
  
}

@Injectable()
@RestParams({
  // IRestParams
  pathPrefix: '/user'
})
export class UserRest extends Rest {
  
  @RestAction({
    path: '/{!id}'
  })
  getUser: IRestMethod<{id: string}, IUser>; // will call /user/id
  
  @RestAction({
    method: RestRequestMethod.Post
  })
  createUser: IRestMethod<IUser, IUser>;
  
  constructor(restHandler: RestHandler) {
    super(restHandler);
  }
  
}

// Using created rest
@Injectable
export class MyService {
  
  private user: IUser = null;

  constructor(private myRest: MyAuthRest, private userRest: UserRest) {}
  
  doLogin(login: string, password: string): Promise<any> {
    return this.login({login, password});
  }
  
  doLogout(): Promise<any> {
    return this.logout();
  }
  
  async loginAndLoadUser(login: string, password: string, userId: string): Promise<any> {
    await this.doLogin(login, password);
    this.user = await this.userRest.getUser({id: userId});
  }
  
}

```

