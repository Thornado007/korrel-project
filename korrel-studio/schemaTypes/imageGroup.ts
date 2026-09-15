import {defineType, defineField, defineArrayMember} from 'sanity'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {articleImageFields, articleImagePreview} from './articleImageFields'

/**
 * Image Group — one or more images shown together with a chosen layout.
 *
 * Lets an article interleave text and images freely: a text block, then a
 * row of three images side by side, then more text, then a single wide
 * image, and so on.
 */
export const imageGroup = defineType({
  name: 'imageGroup',
  title: 'Image Group',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      description:
        'How the images are arranged. On phones wide layouts fall back to fewer columns automatically.',
      type: 'string',
      options: {
        list: [
          {title: 'Stacked — full width, one below the other', value: 'stacked'},
          {title: '2 across', value: 'two'},
          {title: '3 across', value: 'three'},
          {title: '4 across', value: 'four'},
        ],
        layout: 'radio',
      },
      initialValue: 'stacked',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'fit',
      title: 'Image framing',
      description:
        '"Whole image" keeps every image fully visible (heights may differ). "Equal tiles" crops images to a shared aspect ratio for a tidy grid.',
      type: 'string',
      options: {
        list: [
          {title: 'Whole image', value: 'contain'},
          {title: 'Equal tiles (cropped)', value: 'cover'},
        ],
        layout: 'radio',
      },
      initialValue: 'contain',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: articleImageFields,
          preview: articleImagePreview,
        }),
      ],
      validation: (Rule) => Rule.min(1).error('Add at least one image.'),
    }),
    defineField({
      name: 'caption',
      title: 'Group caption',
      type: 'string',
      description: 'Optional caption for the whole group, shown underneath.',
    }),
  ],
  preview: {
    select: {
      layout: 'layout',
      caption: 'caption',
      count: 'images.length',
      media: 'images.0.asset',
    },
    prepare({layout, caption, count, media}) {
      const layouts: Record<string, string> = {
        stacked: 'Stacked',
        two: '2 across',
        three: '3 across',
        four: '4 across',
      }
      const total = typeof count === 'number' ? count : 0
      return {
        title: caption || 'Image Group',
        subtitle: `${layouts[layout as string] ?? 'Layout'} · ${total} image${
          total === 1 ? '' : 's'
        }`,
        media,
      }
    },
  },
})
