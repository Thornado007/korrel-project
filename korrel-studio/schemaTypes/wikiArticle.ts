import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {ImagesIcon} from '@sanity/icons/Images'

/**
 * Equipment/organization categories for Wiki articles.
 * Every article must be filed under exactly one of these so the
 * Wiki stays organized by gear type rather than loose free-text tags.
 */
export const WIKI_CATEGORIES = [
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
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
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
      title: 'Category',
      description: 'Every article must be categorized under one equipment type.',
      type: 'string',
      options: {
        list: WIKI_CATEGORIES,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnailImage',
      title: 'Thumbnail Image',
      description: 'Shown in article listings (e.g. the category page). Optional.',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
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
              name: 'tags',
              title: 'Tags',
              description:
                'Technical tags associated with this image (lens, scanner, film stock, etc.)',
              type: 'array',
              of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
              options: {layout: 'tags'},
            }),
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'imageComparison',
          title: 'Image Comparison',
          icon: ImagesIcon,
          fields: [
            defineField({
              name: 'comparisonType',
              title: 'Comparison Method',
              description: 'Choose how the images are compared.',
              type: 'string',
              options: {
                list: [
                  {title: 'Slider — drag to compare two images', value: 'slider'},
                  {title: 'Overlay — click to toggle between images', value: 'overlay'},
                  {title: 'Slideshow — use arrows to browse images', value: 'slideshow'},
                ],
                layout: 'radio',
              },
              initialValue: 'slider',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'images',
              title: 'Images',
              description: 'Add 2 images for Slider/Overlay, or 2+ for Slideshow.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'image',
                  options: {hotspot: true},
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      description: 'Short label, e.g. "Before", "After", or a lens name.',
                    }),
                    defineField({
                      name: 'tags',
                      title: 'Tags',
                      description:
                        'Technical tags for this comparison image (e.g. lens, film stock).',
                      type: 'array',
                      of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
                      options: {layout: 'tags'},
                    }),
                  ],
                }),
              ],
              validation: (Rule) => Rule.min(2).error('At least 2 images are required.'),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              comparisonType: 'comparisonType',
              caption: 'caption',
              media: 'images.0',
            },
            prepare({comparisonType, caption, media}) {
              const labels: Record<string, string> = {
                slider: 'Slider',
                overlay: 'Overlay Toggle',
                slideshow: 'Slideshow',
              }
              return {
                title: caption || 'Image Comparison',
                subtitle: labels[comparisonType as string] || 'Comparison',
                media,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
      media: 'thumbnailImage',
    },
    prepare({title, subtitle, media}) {
      const label = WIKI_CATEGORIES.find((c) => c.value === subtitle)?.title ?? subtitle
      return {title, subtitle: label, media}
    },
  },
})
