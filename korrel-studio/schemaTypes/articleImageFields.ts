import {defineField, defineArrayMember, type PreviewValue} from 'sanity'

/** The `media` value accepted by Studio previews (image ref, node, etc.). */
type PreviewMediaValue = PreviewValue['media']

/**
 * Shared metadata fields for every image used inside an article body.
 *
 * These are added directly onto `type: 'image'` members (instead of
 * wrapping the image in a custom object) so all previously published
 * image content keeps working unchanged.
 *
 * The taxonomy `tags` only appear once an image is marked as part of the
 * comparison database — a photo of a scanner used to illustrate an
 * article does not need lens/film/light-source metadata, while an actual
 * sample scan does.
 */
export const articleImageFields = [
  defineField({
    name: 'label',
    title: 'Label',
    type: 'string',
    description:
      'Short label shown under the image and on comparison buttons, e.g. "Broadband white", "Narrowband RGB", "Before".',
  }),
  defineField({
    name: 'caption',
    title: 'Caption',
    type: 'text',
    rows: 2,
    description: 'Optional longer description shown underneath the image.',
  }),
  defineField({
    name: 'alt',
    title: 'Alt text',
    type: 'string',
    description: 'Describes the image for screen readers and search engines.',
  }),
  defineField({
    name: 'displayWidth',
    title: 'Display width',
    type: 'string',
    description:
      'How wide the image is rendered. Use a narrower width for tall/portrait images so they do not take up the whole screen height.',
    options: {
      list: [
        {title: 'Full — full column width', value: 'full'},
        {title: 'Large — 80%', value: 'large'},
        {title: 'Medium — 60%', value: 'medium'},
        {title: 'Small — 40%', value: 'small'},
      ],
      layout: 'radio',
    },
    initialValue: 'full',
  }),
  defineField({
    name: 'maxHeight',
    title: 'Limit height (optional)',
    type: 'number',
    description:
      'Maximum height in pixels on wide screens. Handy for very tall images — e.g. 700. Leave empty for no limit.',
    validation: (Rule) => Rule.min(120).max(2000),
  }),
  defineField({
    name: 'includeInComparisons',
    title: 'Include in comparison database',
    type: 'boolean',
    description:
      'Turn on for real sample scans that should be comparable across articles (this unlocks the taxonomy tags below). Leave off for illustrative photos, screenshots, product shots, etc.',
    initialValue: false,
  }),
  defineField({
    name: 'includeInGallery',
    title: 'Also show in the Gallery page',
    type: 'boolean',
    description:
      'Turn on to publish this image to the public Gallery as well (it keeps the tags below, so gallery filters work on it).',
    initialValue: false,
  }),
  defineField({
    name: 'tags',
    title: 'Tags',
    description:
      'Same taxonomy as the Scan Gallery — lens, scanner, film stock, light source, etc.',
    type: 'array',
    of: [defineArrayMember({type: 'reference', to: [{type: 'tag'}]})],
    options: {layout: 'tags'},
    // Only shown when the image is actually published somewhere that uses
    // the taxonomy (the comparison database or the Gallery). Images tagged
    // before these toggles existed keep showing their tags so no metadata
    // silently disappears from the Studio.
    hidden: ({parent}) =>
      !parent?.includeInComparisons &&
      !parent?.includeInGallery &&
      !(Array.isArray(parent?.tags) && parent.tags.length > 0),
  }),
]

/**
 * Preview config shared by image array members so the Studio list shows
 * the label/caption instead of just "Image".
 */
export const articleImagePreview = {
  select: {
    label: 'label',
    caption: 'caption',
    alt: 'alt',
    includeInComparisons: 'includeInComparisons',
    includeInGallery: 'includeInGallery',
    displayWidth: 'displayWidth',
    media: 'asset',
  },
  prepare({
    label,
    caption,
    alt,
    includeInComparisons,
    includeInGallery,
    displayWidth,
    media,
  }: {
    label?: string
    caption?: string
    alt?: string
    includeInComparisons?: boolean
    includeInGallery?: boolean
    displayWidth?: string
    media?: PreviewMediaValue
  }) {
    const flags = [
      includeInComparisons ? 'Comparisons' : null,
      includeInGallery ? 'Gallery' : null,
      displayWidth && displayWidth !== 'full' ? `${displayWidth} width` : null,
    ].filter(Boolean)

    return {
      title: label || caption || alt || 'Image',
      subtitle: flags.length > 0 ? flags.join(' · ') : undefined,
      media,
    }
  },
}
