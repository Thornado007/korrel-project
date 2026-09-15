import {defineType, defineField} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'
import {WIKI_CATEGORIES} from './wikiArticle'

/**
 * Wiki Category Page — one document per equipment category.
 *
 * Editors create one of these for each category (Lens, Film Holder, etc.)
 * to set a thumbnail image and optional description that appear on the
 * Wiki landing page.
 */
export const wikiCategoryPage = defineType({
  name: 'wikiCategoryPage',
  title: 'Wiki Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: WIKI_CATEGORIES,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      description: 'Displayed on the Wiki landing page alongside the category name.',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'orderRank',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first in the category list on the Wiki page.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'orderRank', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      subtitle: 'category',
      media: 'thumbnail',
    },
    prepare({subtitle, media}) {
      const label = WIKI_CATEGORIES.find((c) => c.value === subtitle)?.title ?? subtitle
      return {title: label, media}
    },
  },
})
