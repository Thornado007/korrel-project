import {defineType, defineField, defineArrayMember} from 'sanity'

/**
 * Scanning Service — one document per scanning service offering
 * (e.g. "GFX Camera Scanning", "Nikon Coolscan 5000").
 *
 * Services are displayed side-by-side on the /services page on larger
 * screens and stacked on mobile. Each service can optionally include
 * before/after comparison images shown in a slider.
 */
export const scanningService = defineType({
  name: 'scanningService',
  title: 'Scanning Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Service name, e.g. "Nikon Coolscan 5000".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'orderRank',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers appear first on the page.',
      initialValue: 0,
    }),
    defineField({
      name: 'beforeImage',
      title: 'Before Image',
      type: 'image',
      options: {hotspot: true},
      description: 'The "before" image for the comparison slider (optional).',
    }),
    defineField({
      name: 'afterImage',
      title: 'After Image',
      type: 'image',
      options: {hotspot: true},
      description: 'The "after" image for the comparison slider (optional).',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      description: 'Describe the service — text, headings, and images.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
          ],
          lists: [
            {title: 'Bulleted', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              defineArrayMember({
                type: 'object',
                name: 'link',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) =>
                      Rule.uri({scheme: ['http', 'https', 'mailto', 'tel']}),
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
      ],
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
      title: 'title',
      subtitle: 'orderRank',
      media: 'afterImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Scanning Service',
        subtitle: subtitle != null ? `Order: ${subtitle}` : undefined,
        media,
      }
    },
  },
})
