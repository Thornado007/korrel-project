import {defineType, defineField} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'

/**
 * Taxonomy Categories group tags into meaningful buckets, e.g.
 * "Lens", "Scanner", "Film Stock". Tags reference exactly one
 * category so the Studio can present tags grouped and filtered
 * by kind.
 */
export const taxonomyCategory = defineType({
  name: 'taxonomyCategory',
  title: 'Taxonomy Category',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. Lens, Scanner, Film Stock',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
})
