import {defineType, defineField, defineArrayMember} from 'sanity'
import {SplitHorizontalIcon} from '@sanity/icons/SplitHorizontal'
import {articleImageFields, articleImagePreview} from './articleImageFields'

/**
 * Image Comparison — a reusable article block for comparing images.
 *
 * Three methods:
 * - `slider`   — drag a handle across two stacked images
 * - `overlay`  — all images sit on top of each other; large, always
 *                visible buttons underneath switch between them
 *                (option 1 → image 1, option 2 → image 2, …)
 * - `slideshow`— browse images one at a time, info/title shown below
 *
 * Previously this block was declared inline inside `wikiArticle`. It is
 * now a top-level type so it can be reused by any article body, while
 * keeping the exact same `_type` name so published content still renders.
 */
export const imageComparison = defineType({
  name: 'imageComparison',
  title: 'Image Comparison',
  type: 'object',
  icon: SplitHorizontalIcon,
  fields: [
    defineField({
      name: 'comparisonType',
      title: 'Comparison Method',
      description: 'Choose how the images are compared.',
      type: 'string',
      options: {
        list: [
          {title: 'Slider — drag across two images', value: 'slider'},
          {
            title: 'Overlay — images stacked, buttons switch between them',
            value: 'overlay',
          },
          {title: 'Slideshow — browse images, info shown underneath', value: 'slideshow'},
        ],
        layout: 'radio',
      },
      initialValue: 'overlay',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      description:
        'Slider uses the first 2 images. Overlay and Slideshow support any number of images — the order here is the order of the buttons.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: articleImageFields,
          preview: articleImagePreview,
        }),
      ],
      validation: (Rule) => Rule.min(2).error('At least 2 images are required.'),
    }),
    defineField({
      name: 'showLabelsUnderneath',
      title: 'Show label & info underneath',
      description:
        'Shows the active image’s label and caption below the frame instead of overlaying it on the image.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption for the whole comparison.',
    }),
  ],
  preview: {
    select: {
      comparisonType: 'comparisonType',
      caption: 'caption',
      count: 'images.length',
      media: 'images.0.asset',
    },
    prepare({comparisonType, caption, count, media}) {
      const labels: Record<string, string> = {
        slider: 'Slider',
        overlay: 'Overlay switch',
        slideshow: 'Slideshow',
      }
      const total = typeof count === 'number' ? count : 0
      return {
        title: caption || 'Image Comparison',
        subtitle: `${labels[comparisonType as string] ?? 'Comparison'} · ${total} image${
          total === 1 ? '' : 's'
        }`,
        media,
      }
    },
  },
})
