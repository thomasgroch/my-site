import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { byNewest } from '@/lib/blog.js'

// Feed do blog. Rascunhos nunca entram, nem em desenvolvimento.
export async function GET(context) {
  const posts = (await getCollection('blog', (post) => !post.data.draft)).sort(byNewest)
  return rss({
    title: 'Thomas Dev Blog',
    description: 'Posts about web development by Thomas Dev.',
    site: context.site,
    customData: '<language>en</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}`,
      categories: post.data.tags,
    })),
  })
}
