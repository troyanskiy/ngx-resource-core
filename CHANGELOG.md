## 0.2.0

### Bug Fixes

* Default query parameter build method set to `RestGlobalConfig`

### Improvements

* Added flag `queryMappingMethod` to `RestParams` and `RestAction` to define 
query parameter build method per Rest class or per method.

### Breaking changes

* `getParamsMappingType` property renamed to `queryMappingMethod` in `RestGlobalConfig`
* `RestGetParamsMappingType` enum renamed to `RestQueryMappingMethod`

## 0.1.0 Release