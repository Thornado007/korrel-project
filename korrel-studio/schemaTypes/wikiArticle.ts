import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

/**
 * Equipment/organization categories for Wiki articles.
 *
 * Categories are now optional and multi-select: an article can sit in
 * several category submenus, or in none at all when it is simply a blog
 * post that only needs to be featured under "Selected articles".
 */
export const WIKI_CATEGORIES = [
  {title: 'General', value: 'general'},
  {title: 'Lens', value: 'lens'},
  {title: 'Film Holder', value: 'filmHolder'},
  {title: 'Light Source', value: 'lightSource'},
  {title: 'Copy Stand', value: 'copyStand'},
  {title: 'Inversion Software', value: 'inversionSoftware'},
]

export const wikiArticle = defineType({
  name: 'wikiArticle',
  title: 'Wiki Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'settings', title: 'Settings'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'settings',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      description:
        'Optional. Choose one or more equipment categories this article should appear under. Leave empty for a standalone blog post — feature it via the Wiki Page instead.',
      type: 'array',
      group: 'settings',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: WIKI_CATEGORIES,
        layout: 'grid',
      },
    }),
    /**
     * Legacy single-category field. Kept (read-only) so previously
     * published articles keep working and can be migrated at leisure —
     * the frontend falls back to it when `categories` is empty.
     */
    defineField({
      name: 'category',
      title: 'Category (legacy)',
      description:
        'Replaced by the multi-select "Categories" field above. Still used as a fallback when Categories is empty.',
      type: 'string',
      group: 'settings',
      readOnly: true,
      hidden: ({value}) => !value,
      options: {
        list: WIKI_CATEGORIES,
      },
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      description:
        'Shown in article listings — the Wiki "Selected articles" section and the category pages.',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      description: 'Short summary shown under the title in listings. Optional.',
      type: 'text',
      rows: 3,
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      description:
        'Mix text, image groups and comparisons in any order. Use "Image Group" for images side by side, and "Image Comparison" for slider / overlay / slideshow comparisons.',
      type: 'articleBody',
      group: 'content',
    }),
    defineField({
      name: 'sources',
      title: 'Sources',
      description:
        'Reference list rendered at the end of the article — general sources plus separate credits for images and figures.',
      type: 'articleSources',
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      categories: 'categories',
      legacyCategory: 'category',
      media: 'thumbnailImage',
    },
    prepare({title, categories, legacyCategory, media}) {
      const values: string[] =
        Array.isArray(categories) && categories.length > 0
          ? categories
          : legacyCategory
            ? [legacyCategory]
            : []
      const labels = values
        .map((value) => WIKI_CATEGORIES.find((c) => c.value === value)?.title ?? value)
        .join(', ')
      return {title, subtitle: labels || 'No category', media}
    },
  },
})
