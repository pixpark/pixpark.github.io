import type { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Config['sidebar'] = {
  '/docs/gpupixel': [
    {
      text: 'Introduction',
      collapsed: false,
      items: [
        { text: 'Quick Start', link: '/docs/gpupixel/start' },
        { text: 'Build', link: '/docs/gpupixel/run' },
      ]
    },
    {
      text: '编译',
      collapsed: false,
      items: [
        { text: 'iOS编译', link: '/fe/html/' },
        { text: 'Android编译', link: '/fe/css/' }
      ]
    },
    {
      text: '集成',
      link: '/fe/coding/'
    }
  ],
  '/docs/sphere-camera': [
    {
      text: 'KKK',
      collapsed: false,
      items: [
        { text: 'eee', link: '/docs/sphere-camera/start' },
        { text: 'Build', link: '/docs/sphere-camera//run' },
      ]
    },
    {
      text: 'BBB',
      collapsed: false,
      items: [
        { text: 'jjj', link: '/fe/html/' },
        { text: 'mmmm', link: '/fe/css/' }
      ]
    },
    {
      text: 'iiii成',
      link: '/fe/coding/'
    }
  ],
  '/projects/': [
    {
      text: '工具库',
      // collapsed: false,
      items: [
        { text: 'gpupixel', link: '/projects/gpupixel/start' },
        { text: 'sphere-camera', link: '/projects/sphere-camera/start' }
      ]
    }
  ],
  '/blog/': [
    {
      text: '2023年',
      // collapsed: false,
      items: [
        { text: 'Post-1', link: '/projects/gpupixel/start' },
        { text: 'Post-2', link: '/projects/sphere-camera/start' }
      ]
    },
    {
      text: '2022年',
      // collapsed: false,
      items: [
        { text: 'Post-1', link: '/projects/gpupixel/start' },
        { text: 'Post-2', link: '/projects/sphere-camera/start' }
      ]
    }
  ]
}
