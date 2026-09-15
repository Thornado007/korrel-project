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
    name: 'includeInComparisons',
    title: 'Include in comparison database',
    type: 'boolean',
    description:
      'Turn on for real sample scans that should be comparable across articles (this unlocks the taxonomy tags below). Leave off for illustrative photos, screenshots, product shots, etc.',
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
    // Hidden unless the image is part of the comparison database. Images
    // tagged before this toggle existed keep showing their tags so no
    // metadata silently disappears from the Studio.
    hidden: ({parent}) =>
      !parent?.includeInComparisons && !(Array.isArray(parent?.tags) && parent.tags.length > 0),
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
    media: 'asset',
  },
  prepare({
    label,
    caption,
    alt,
    includeInComparisons,
    media,
  }: {
    label?: string
    caption?: string
    alt?: string
    includeInComparisons?: boolean
    media?: PreviewMediaValue
  }) {
    return {
      title: label || caption || alt || 'Image',
      subtitle: includeInComparisons ? 'In comparison database' : undefined,
      media,
    }
  },
}
