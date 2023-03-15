import { add } from '../src/index'
import { ref } from '../src/reactivity/index'
it('init', () => {
    expect(add('1',2)).toBe('12')
})

it('ref', () => {
    expect(ref()).toBe('this is ref function')
})
