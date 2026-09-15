import {defineType, defineField, defineArrayMember} from 'sanity'
import {StarIcon} from '@sanity/icons/Star'

/**
 * Wiki Page — singleton holding the Wiki landing page layout.
 *
 * The landing page shows two sections:
 * 1. "Selected articles" at the top — hand-picked articles (with their
 *    thumbnails) so a standalone blog post such as an RGB-scanning
 *    write-up can be featured without belonging to an equipment category.
 * 2. The category submenus underneath, driven by `wikiCategoryPage`
 *    documents.
 */
export const wikiPage = defineType({
  name: 'wikiPage',
  title: 'Wiki Page',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'selectedTitle',
      title: 'Selected Articles — Heading',
      type: 'string',
      description: 'Heading above the hand-picked articles. Defaults to "Selected articles".',
      initialValue: 'Selected articles',
    }),
    defineField({
      name: 'selectedArticles',
      title: 'Selected Articles',
      description:
        'Pick the articles shown at the top of the Wiki page. Each one uses its own thumbnail image. Leave empty to hide the section.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'wikiArticle'}]})],
    }),
    defineField({
      name: 'selectedLayout',
      title: 'Selected Articles — Layout',
      type: 'string',
      options: {
        list: [
          {title: 'Feature first article, rest in a grid', value: 'feature'},
          {title: 'Even grid', value: 'grid'},
        ],
        layout: 'radio',
      },
      initialValue: 'feature',
    }),
    defineField({
      name: 'categoriesTitle',
      title: 'Categories — Heading',
      type: 'string',
      description: 'Heading above the category list. Defaults to "Browse by category".',
      initialValue: 'Browse by category',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Wiki Page'}
    },
  },
})
