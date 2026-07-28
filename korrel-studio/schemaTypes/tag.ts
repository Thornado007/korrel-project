import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

/**
 * A single reusable, taggable term (e.g. "Nikon Coolscan", "Portra 400").
 * Every tag belongs to exactly one Taxonomy Category so tags stay
 * organized (Lens, Scanner, Film Stock, etc.) and can be filtered/grouped
 * in the Studio and on the frontend.
 */
export const tag = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. Nikon Coolscan, Portra 400',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Taxonomy Category',
      type: 'reference',
      to: [{type: 'taxonomyCategory'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
    },
  },
})
