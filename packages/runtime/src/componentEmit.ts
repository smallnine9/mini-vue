import { toHandlerKey, camelize } from '../../shared'
export function emit(instance, event, ...args) {
    const { props } = instance

    
    const handlerKey = toHandlerKey(camelize(event))
    const handler = props[handlerKey]
    handler && handler(...args)
}