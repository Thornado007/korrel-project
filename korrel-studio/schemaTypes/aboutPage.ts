import {defineType, defineField} from 'sanity'

/**
 * About Page — standalone singleton document for the /about route.
 *
 * Separated from the Home Page so each can be edited independently.
 */
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'About Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The main heading on the about page.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Rich text content for the about page.',
      of: [{type: 'block'}],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'About Page'}
    },
  },
})
