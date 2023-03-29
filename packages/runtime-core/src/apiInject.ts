import { getCurrentInstance } from './component'
export function provide(
    key: any,
    value: any
) {
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        let { provides } = currentInstance
        const parentProvides = currentInstance.parent && currentInstance.parent.provides
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides)
        } 
        provides[key] = value
    }
}

export function inject(
    key,
    value
) {
    const currentInstance :any = getCurrentInstance()
    if (currentInstance) {
        const { parent } = currentInstance
        const { provides } = parent || {}
        return provides[key] || value
    }
}