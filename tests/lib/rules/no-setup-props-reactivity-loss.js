/**
 * @author Yosuke Ota
 */
'use strict'

const RuleTester = require('../../eslint-compat').RuleTester
const rule = require('../../../lib/rules/no-setup-props-reactivity-loss')

const tester = new RuleTester({
  languageOptions: {
    parser: require('vue-eslint-parser'),
    ecmaVersion: 2020,
    sourceType: 'module'
  }
})

tester.run('no-setup-props-reactivity-loss', rule, {
  valid: [
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          watch(() => {
            console.log(props.count) // ok
          })

          return () => {
            return h('div', props.count) // ok
          }
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          watch(() => {
            const { count } = props // ok
            console.log(count)
          })

          return () => {
            const { count } = props // ok
            return h('div', count)
          }
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        _setup({count}) {
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup() {
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(...args) {
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          watch(() => {
            ({ count } = props)
          })
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      var noVue = {
        setup(props) {
          const { count } = props
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          watch(
            () => props.count,
            () => {
              const test = props.count ? true : false
              console.log(test)
            }
          )

          return () => {
            return h('div', props.count ? true : false)
          }
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          const {x} = noProps
          ({y} = noProps)
          const z = noProps.z
          const foo = \`\${noProp.foo}\`
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          ({props} = x)
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        watch: {
          setup({val}) { }
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          const props2 = props
        }
      }
      </script>
      `
    },
    `
      Vue.component('test', {
        el: a = b
      })
    `,
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({count:Number})
      watch(() => {
        const {count} = props
      })
      watch(() => {
        const count = props.count
      })
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({count:Number})
      watch(() => {
        ({ count } = props)
      })
      watch(() => {
        count = props.count
      })
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup: (props) => {
          const count = computed(() => props.count)
        }
      }
      </script>
      `
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const count = computed(() => props.count)
      </script>
      `
    }
  ],
  invalid: [
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup({ count }) { // error
          watch(() => {
            console.log(count) // not going to detect changes
          })

          return () => {
            return h('div', count) // not going to update
          }
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'destructuring',
          line: 4,
          column: 15,
          endLine: 4,
          endColumn: 24
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          const { count } = props // error
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5,
          column: 17,
          endLine: 5,
          endColumn: 26
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup: (props) => {
          const { count } = props
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(props) {
          ({ count } = props)
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const { count } = p
        }
      }

      Vue.component('component', {
        setup(p) {
          const { count } = p
        }
      })
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        },
        {
          messageId: 'getProperty',
          line: 11
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const { count } = p
        },
        _setup(p) {
          const { count } = p
        },
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const { x } = p
          const { y } = p
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        },
        {
          messageId: 'getProperty',
          line: 6
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const foo = p.bar
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const x = p.foo
          const y = p?.bar
          const z = (p?.baz).qux

          const xc = p?.foo?.()
          const yc = (p?.bar)?.()
          const zc = (p?.baz.qux)?.()
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        },
        {
          messageId: 'getProperty',
          line: 6
        },
        {
          messageId: 'getProperty',
          line: 7
        },
        {
          messageId: 'getProperty',
          line: 9
        },
        {
          messageId: 'getProperty',
          line: 10
        },
        {
          messageId: 'getProperty',
          line: 11
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          let foo
          foo = p.bar
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 6
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const {foo} = p.bar
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          foo.bar = p.bar
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const {count} = defineProps({count:Number})
      </script>
      `,
      errors: [
        {
          message:
            'Destructuring the `props` will cause the value to lose reactivity.',
          line: 3
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({count:Number})
      const {count} = props
      ;({count} = props)
      </script>
      `,
      errors: [
        {
          message:
            'Getting a value from the `props` in root scope of `<script setup>` will cause the value to lose reactivity.',
          line: 4
        },
        {
          message:
            'Getting a value from the `props` in root scope of `<script setup>` will cause the value to lose reactivity.',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({count:Number})
      const count = props.count
      count = props.count
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        },
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup: (props) => {
          const count = ref(props.count)
          count = fn(props.count)
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        },
        {
          messageId: 'getProperty',
          line: 6
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const count = ref(props.count)
      count = fn(props.count)
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        },
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const newProps = ref({ count: props.count })
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const counts = [props.count]
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const counter = { count: props.count }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const counters = [{ count: [props.count] }]
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const buildCounter = (count) => ({ count })

      buildCounter(props.count)
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 6
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script setup>
      const props = defineProps({ count: Number })
      const buildCounter = props.count ? 1 : undefined
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 4
        }
      ]
    },
    {
      // https://github.com/vuejs/eslint-plugin-vue/issues/2470
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const foo = \`\${p.x}\`
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    },
    {
      filename: 'test.vue',
      code: `
      <script>
      export default {
        setup(p) {
          const foo = \`bar\${p.x}bar\${p.y}\`
        }
      }
      </script>
      `,
      errors: [
        {
          messageId: 'getProperty',
          line: 5
        }
      ]
    }
  ]
})
