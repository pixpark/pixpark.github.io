import { defineConfig } from 'vitepress'
import { head, nav, sidebar } from './configs'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "PixPark",
  description: "PixPark WebSite",
  lang: 'en-US',
  head,
  markdown: {
    config: (md) => {
      md.use(require('markdown-it-task-lists'))
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    i18nRouting: true,
    siteTitle: 'PixPark',
    logo: '/logo.png',
    // nav and sidebar
    nav,
    sidebar,
    socialLinks: [
      { icon: 'youtube', link: 'https://www.youtube.com/@pixpark' },
      { icon: 'github', link: 'https://github.com/pixpark' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present PixPark'
    },
    // 
    editLink: {
      pattern: 'https://github.com/pixpark/pixpark.github.io/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    search: {
      provider: 'local'
    },
  }
})
