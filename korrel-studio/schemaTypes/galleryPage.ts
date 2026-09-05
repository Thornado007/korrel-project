import {defineType, defineField, defineArrayMember} from 'sanity'

/**
 * Gallery Page — singleton for gallery page settings.
 *
 * Controls which taxonomy categories appear as filter options on the
 * gallery page, letting visitors narrow scans by e.g. scanner type,
 * film stock, or lens.
 */
export const galleryPage = defineType({
  name: 'galleryPage',
  title: 'Gallery Page',
  type: 'document',
  fields: [
    defineField({
      name: 'filters',
      title: 'Filter Categories',
      description:
        'Choose which taxonomy categories appear as filter buttons on the gallery page. Visitors can then filter scans by tags within these categories.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'taxonomyCategory'}]})],
      options: {
        layout: 'tags',
      },
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Gallery Page'}
    },
  },
})
