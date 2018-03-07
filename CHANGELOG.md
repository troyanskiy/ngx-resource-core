## 5.2.2

### Bugs fixed

* Remove body from DELETE requests #20

## 5.2.0

### Improvement

* Added static fields to `ResourceModel` in order to define custom resource method names
``` typescript
  protected static methodQuery: string = 'query';
  protected static methodGet: string = 'get';
  protected static methodCreate: string = 'create';
  protected static methodUpdate: string = 'update';
  protected static methodRemove: string = 'remove';
```
  
## 5.1.0

### Improvement

* Added static methods `ResourceModel` in order to not inject resources (need to inject once to create instance into
your `AppComponent` (first loaded component)
  * `get(id: string): Promise<any>`
  * `query(query?: any): Promise<any[]>`
  * `remove(id: string): Promise<void>`

## 5.0.0

### Breaking changes

* Use npm `@ngx-resource/core` instead of `rest-core`
* All `Rest` names and file refactored to `Resource`

## 0.2.0

### Bug Fixes

* Default query parameter build method set to `RestGlobalConfig`

### Improvements

* Added flag `queryMappingMethod` to `RestParams` and `RestAction` to define 
query parameter build method per Rest class or per method.

### Breaking Changes

* `getParamsMappingType` property renamed to `queryMappingMethod` in `RestGlobalConfig`
* `RestGetParamsMappingType` enum renamed to `RestQueryMappingMethod`

## 0.1.2 Release
