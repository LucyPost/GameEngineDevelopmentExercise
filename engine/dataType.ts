export type ActorFileData = {
    actors: ActorData[]
}
export type ActorData = {
    name: string,
    class: string,
    transform: any,
    children?: ActorData[],
    components: ComponenetData[]
    properties?: any

    physicsBodyShape?: string
    physicsBodyType?: string
    physicsBodyCollisionPreset?: string
}
export type ComponenetData = {
    type: string,
    properties: any
}
export type InputMappingContextsFileData = {
    contexts: InputMappingContextnData[]
}
export type InputMappingContextnData = {
    name: string,
    actions: {
        name: string,
        mode?: string,
        keys: {
            key: string,
            factor?: number
        }[],
    }[]
}