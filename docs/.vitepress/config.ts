import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PixPark",
  description: "Real-time audio and video processing toolset for developers",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Docs', link: '/docs' },
      { text: 'Blog', link: '/blog/' }
    ],

    sidebar: [
      {
        text: 'Docs',
        items: [
          { text: 'GPUPixel', link: '/docs' },
          { text: 'PanoCam', link: '/panocam-docs' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'twitter', link: 'https://twitter.com/PixParkOSS' },
      { icon: 'youtube', link: 'https://www.youtube.com/@pixpark' },
      { icon: 'github', link: 'https://github.com/pixpark' }
    ]
  }
})
