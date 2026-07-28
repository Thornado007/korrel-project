import {defineType, defineField, defineArrayMember} from 'sanity'
import {ImagesIcon} from '@sanity/icons/Images'

/**
 * Scan Gallery (formerly "Scan").
 *
 * Renamed for clarity in the Studio GUI, with the unused "description"
 * field removed and a proper tagging system added so each scan can be
 * tagged with the gear/film used (e.g. "Nikon Coolscan", "Portra 400").
 * Tags reference the `tag` document type, which itself belongs to a
 * `taxonomyCategory` (Lens, Scanner, Film Stock, etc.), so tags stay
 * organized and reusable across the whole gallery.
 */
export const scanGallery = defineType({
  name: 'scanGallery',
  title: 'Scan Gallery',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description:
        'Technical tags for this scan, e.g. the lens, scanner, or film stock used.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
      options: {
        // Renders references as removable "chips" for a faster tagging workflow.
        layout: 'tags',
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
    },
  },
})
