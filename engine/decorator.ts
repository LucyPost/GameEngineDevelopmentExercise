const UProperty: PropertyDecorator = (target: any, propertyKey: string) => {
    const properties = target.__properties__ || []
    target.__properties__ = properties
    properties.push(propertyKey)
}